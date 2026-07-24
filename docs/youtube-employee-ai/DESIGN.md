# YouTube社員AI - 設計ドキュメント (MVP)

> ステータス: 設計フェーズ(コード未着手)
> 対象: MVP。保守性・拡張性(TikTok/Instagram/X社員への展開)を最優先。
> アーキテクチャ方針: Clean Architecture(依存性逆転・関心の分離)

## コンセプト

YouTube Studioの代替ではなく、「YouTube担当社員」として毎朝

- 昨日どうだったか(サマリー)
- 今日やるべきこと(TODO)
- 改善案(サジェスチョン)

を自動生成して提示するサービス。将来的に同じ基盤で「TikTok社員」「Instagram社員」「X社員」を追加できることを設計の大前提とする。

---

## ① ディレクトリ構成

Clean Architectureの4層(Presentation / Application / Domain / Infrastructure)を明示的にディレクトリへ落とし込む。ポイントは **domain 層が YouTube を一切知らない** こと。YouTube固有の実装はすべて `infrastructure/platforms/youtube` に閉じ込め、将来のTikTok追加時はここに並列ディレクトリを増やすだけで済むようにする。

```
/
├── docs/
│   └── youtube-employee-ai/
│       ├── DESIGN.md
│       └── TASKS.md
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── src/
│   ├── app/                              # Presentation層 (Next.js App Router)
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   └── callback/route.ts         # Supabase Auth OAuthコールバック
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx                  # 今日のブリーフィング
│   │   │   ├── history/page.tsx          # 過去の分析履歴
│   │   │   └── settings/page.tsx         # チャンネル連携設定
│   │   ├── api/
│   │   │   ├── channels/route.ts
│   │   │   ├── channels/[id]/route.ts
│   │   │   ├── channels/connect/route.ts     # YouTube OAuth開始
│   │   │   ├── channels/connect/callback/route.ts
│   │   │   ├── briefings/today/route.ts
│   │   │   ├── briefings/history/route.ts
│   │   │   ├── briefings/[channelId]/regenerate/route.ts
│   │   │   └── cron/daily-analysis/route.ts  # Vercel Cronエントリポイント
│   │   ├── error.tsx
│   │   ├── layout.tsx
│   │   └── globals.css
│   │
│   ├── components/                       # UIコンポーネント(dumb / presentation-only)
│   │   ├── ui/                           # Button, Card, Badge, Skeleton等の基礎部品
│   │   ├── briefing/                     # BriefingHeader, YesterdaySummaryCard, TodayTodoList, ImprovementSuggestionList
│   │   ├── channel/                      # ChannelConnectCard, ChannelSwitcher
│   │   └── layout/                       # AppShell, Header, Sidebar, PlatformTabs
│   │
│   ├── domain/                           # ===== ドメイン層(フレームワーク非依存) =====
│   │   ├── entities/
│   │   │   ├── Channel.ts
│   │   │   ├── Briefing.ts               # 分析結果のドメインモデル
│   │   │   ├── VideoMetric.ts
│   │   │   └── Platform.ts               # プラットフォーム共通の型定義
│   │   ├── usecases/
│   │   │   ├── GenerateDailyBriefing.ts
│   │   │   ├── ConnectChannel.ts
│   │   │   ├── DisconnectChannel.ts
│   │   │   ├── FetchChannelMetrics.ts
│   │   │   └── RegenerateBriefing.ts
│   │   └── ports/                        # 抽象インターフェース(DIPの要)
│   │       ├── PlatformDataProvider.ts   # YouTube/TikTok共通のデータ取得IF
│   │       ├── AIAnalyzer.ts             # AI分析IF(OpenAI等)
│   │       ├── BriefingRepository.ts
│   │       ├── ChannelRepository.ts
│   │       └── UserRepository.ts
│   │
│   ├── infrastructure/                   # ===== 外部実装(アダプタ) =====
│   │   ├── platforms/
│   │   │   └── youtube/
│   │   │       ├── YouTubeDataProvider.ts      # PlatformDataProviderの実装
│   │   │       ├── youtubeDataApiClient.ts
│   │   │       ├── youtubeAnalyticsApiClient.ts
│   │   │       └── mappers.ts                  # 生APIレスポンス→ドメイン型変換
│   │   ├── ai/
│   │   │   └── OpenAIAnalyzer.ts               # AIAnalyzerの実装
│   │   ├── db/
│   │   │   ├── prismaClient.ts
│   │   │   ├── PrismaBriefingRepository.ts
│   │   │   ├── PrismaChannelRepository.ts
│   │   │   └── PrismaUserRepository.ts
│   │   └── auth/
│   │       └── supabaseAuthClient.ts
│   │
│   ├── application/                      # ===== ユースケース合成層(App Services) =====
│   │   └── services/
│   │       ├── briefingService.ts        # usecase合成・トランザクション境界
│   │       └── channelService.ts
│   │
│   ├── lib/                              # 横断的関心事
│   │   ├── env.ts                        # 環境変数バリデーション(zod)
│   │   ├── logger.ts
│   │   ├── errors.ts                     # AppErrorクラス階層
│   │   ├── crypto.ts                     # トークン暗号化/復号
│   │   └── di/container.ts               # 簡易DIコンテナ(factory関数群)
│   │
│   ├── types/
│   │   └── supabase.ts                   # Supabase生成型
│   │
│   └── config/
│       └── platforms.ts                  # プラットフォームレジストリ(拡張ポイント)
│
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── .env.example
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── vercel.json
```

**拡張時の変更範囲(例: TikTok社員追加)**
- 追加: `infrastructure/platforms/tiktok/TikTokDataProvider.ts`
- 追加: `config/platforms.ts` にレジストリエントリを追加
- 追加: Prismaの `PlatformType` enumに `TIKTOK` を追加(マイグレーション1本)
- 変更不要: `domain/`, `application/`, UIコンポーネントの大部分(`PlatformTabs` でチャンネル種別を切り替えるのみ)

---

## ② コンポーネント構成

コンポーネントは「ドメイン型を受け取るだけの純粋な表示部品」として設計し、APIの生データ整形はInfrastructure層で完結させる(コンポーネントにYouTube固有のフィールド名を持ち込まない)。

| 分類 | コンポーネント | 役割 |
|---|---|---|
| Layout | `AppShell` | 全体レイアウト(Header + Sidebar + Content) |
| Layout | `Header` | ユーザーアバター、ログアウト |
| Layout | `Sidebar` / `PlatformTabs` | ナビゲーション。将来のプラットフォーム切替タブ(MVPではYouTubeのみ表示) |
| Auth | `LoginButton` | Google OAuthログイン開始 |
| Auth | `AuthGuard`(middleware) | 未ログイン時はloginへリダイレクト |
| Channel | `ChannelConnectCard` | 未連携時にYouTube連携を促すカード |
| Channel | `ChannelSwitcher` | 複数チャンネル切替(MVPは1チャンネルでも将来のため設計) |
| Briefing | `BriefingHeader` | 対象日・チャンネル名・再生成ボタン |
| Briefing | `YesterdaySummaryCard` | 再生回数・登録者増減・急上昇動画などのサマリー |
| Briefing | `MetricTrendChart` | 直近7日間の簡易推移グラフ |
| Briefing | `TodayTodoList` | 今日やるべきことのチェックリスト |
| Briefing | `ImprovementSuggestionList` | 改善提案カード群(優先度バッジ付き) |
| 状態表示 | `LoadingSkeleton` / `EmptyState` / `ErrorState` / `ReauthRequiredBanner` | ローディング・未生成・失敗・再認証必要の各状態UI |
| History | `BriefingHistoryList` / `BriefingHistoryItem` | 過去分析の一覧・詳細 |
| Settings | `AccountSettingsForm` | Google連携解除など |

設計原則: `components/` 配下は state を持たず props 駆動。データ取得は `app/(dashboard)/*/page.tsx`(Server Component)が `application/services` を呼び出して行う。

---

## ③ DB設計(Prismaモデル概念設計)

```
User
  id            String   @id
  supabaseAuthId String  @unique
  email         String   @unique
  createdAt     DateTime

Channel
  id                String   @id
  userId            String            // → User
  platformType      PlatformType      // enum: YOUTUBE (将来 TIKTOK, INSTAGRAM, X)
  externalChannelId String            // YouTubeチャンネルID
  displayName       String
  accessTokenEnc    String            // 暗号化済み
  refreshTokenEnc   String            // 暗号化済み
  tokenExpiresAt    DateTime
  isActive          Boolean  @default(true)
  status            ChannelStatus     // CONNECTED / REAUTH_REQUIRED / DISCONNECTED
  connectedAt       DateTime
  updatedAt         DateTime

Briefing
  id                  String   @id
  channelId           String            // → Channel
  targetDate           Date             // 分析対象日(昨日)
  status               BriefingStatus   // PENDING / COMPLETED / FAILED
  yesterdaySummaryJson Json
  todosJson            Json
  suggestionsJson      Json
  rawMetricsJson       Json             // デバッグ・再分析用の正規化済みメトリクス
  aiModel              String
  generatedAt          DateTime?
  errorMessage         String?
  @@unique([channelId, targetDate])     // 冪等性の担保

VideoMetricSnapshot   // 推移グラフ・履歴分析用(正規化済み)
  id            String   @id
  channelId     String
  videoId       String
  date          Date
  views         Int
  likes         Int
  comments      Int
  watchTimeMin  Int
  impressions   Int?
  ctr           Float?
  @@unique([channelId, videoId, date])

JobRun   // 毎朝バッチの実行監視用
  id           String   @id
  channelId    String?
  jobType      String            // "daily-analysis"
  status       JobRunStatus      // SUCCESS / PARTIAL / FAILED
  startedAt    DateTime
  finishedAt   DateTime?
  durationMs   Int?
  errorMessage String?
```

設計上の注意点:
- `accessTokenEnc`/`refreshTokenEnc` はアプリ層で暗号化してから保存(平文保存禁止)。
- `Briefing` は `(channelId, targetDate)` でユニーク制約 → 同日再実行時はupsertで冪等に。
- `Channel.status` を分離することで「連携済みだがトークン失効」状態をUIで明確に扱える。
- MVPでは`VideoMetricSnapshot`は動画単位の主要指標のみ保存し、詳細分析は将来拡張とする。

---

## ④ API設計

Next.js Route Handlers。ルートは薄いアダプタとして扱い、ビジネスロジックは持たせない(`application/services` を呼ぶだけ)。

| Method | Path | 用途 |
|---|---|---|
| GET | `/api/channels` | ログインユーザーの連携チャンネル一覧 |
| POST | `/api/channels/connect` | YouTube OAuth開始(consent画面へリダイレクト) |
| GET | `/api/channels/connect/callback` | OAuthコールバック。トークン交換・Channel保存 |
| DELETE | `/api/channels/:id` | チャンネル連携解除 |
| GET | `/api/briefings/today?channelId=` | 本日分のブリーフィング取得 |
| GET | `/api/briefings/history?channelId=&cursor=` | 過去分析の一覧(カーソルページング) |
| POST | `/api/briefings/:channelId/regenerate` | 手動再生成(レート制限あり、例: 1時間に1回まで) |
| POST | `/api/cron/daily-analysis` | Vercel Cron専用。`CRON_SECRET`ヘッダ必須。全チャンネル分析実行 |

認可方針: 全エンドポイントでSupabaseセッションを検証し、`Channel.userId === session.user.id` を確認(横断アクセス禁止)。Cronルートのみユーザーセッションではなく共有シークレットで保護。

---

## ⑤ AI分析フロー

1. `FetchChannelMetrics` usecase が `PlatformDataProvider`(YouTube実装)経由で昨日の指標を取得し、**プラットフォーム非依存の正規化済み構造**(`ChannelDailyStats`, `VideoMetric[]`)に変換する。
2. 正規化済みデータから、AIへ渡す構造化コンテキスト(JSON)を組み立てる(生のYouTube API JSONは絶対に直接渡さない。トークン効率とプラットフォーム非依存性のため)。
3. `AIAnalyzer.generateBriefing(context)` が固定のシステムプロンプト(「あなたはYouTube担当社員です…」)+ 構造化入力でOpenAI APIを呼び出し、Structured Output(JSON Schema指定)で以下を要求:
   ```
   { yesterdaySummary: {...}, todos: [...], suggestions: [...] }
   ```
4. zodスキーマでAI応答をバリデーション。失敗時は1回だけ厳格な指示で再試行。再失敗時は `Briefing.status = FAILED` として保存し、バッチ全体は継続。
5. `BriefingRepository` を通じて `(channelId, targetDate)` でupsert保存。

拡張性ポイント: `AIAnalyzer` ポートは常に「正規化済みコンテキスト → 構造化ブリーフィング」の変換のみを担当するため、TikTok分析でも同じインターフェースを再利用できる(システムプロンプトのみプラットフォーム別に差し替え)。

---

## ⑥ 認証フロー

2種類のOAuthを明確に分離する。

**(A) アプリログイン**: Supabase Auth + Google Provider
1. ユーザーがGoogleでログイン → Supabaseがセッションを発行(Cookie)
2. 初回ログイン時、`ConnectUser` usecase相当の処理で `User` テーブルへ同期(upsert)

**(B) YouTubeチャンネル連携**: 独立したGoogle OAuth(YouTubeスコープ)
1. ログイン済みユーザーが「YouTubeチャンネルを連携」をクリック
2. サーバーがCSRF対策の`state`を発行し、`youtube.readonly` / `yt-analytics.readonly` スコープでGoogle同意画面へリダイレクト
3. コールバックでコードをトークン交換 → YouTube Data APIでチャンネル情報取得 → `Channel` レコードをupsert(トークンは暗号化して保存)
4. 以降のAPI呼び出し前に `TokenRefresher` が `tokenExpiresAt` を確認し、必要ならrefresh_tokenで更新

認可チェック: すべての読み取りで `Channel.userId === session.user.id` を確認。

---

## ⑦ データ取得フロー

`YouTubeDataProvider`(`PlatformDataProvider` の実装)の責務:
- `getChannelProfile(channel)`: YouTube Data API `channels.list` でチャンネル基本情報取得
- `getYesterdayStats(channel, date)`: YouTube Analytics API `reports.query` で日次集計(再生数・総再生時間・登録者増減・高評価数・コメント数・インプレッション・CTR)を動画単位ディメンションで**1回のクエリにまとめて取得**(N+1回避、クォータ節約)
- `getRecentVideoMeta(channel)`: Data API でタイトル・サムネイルなどのメタ情報を補完

クォータ対策: 同一バッチ実行内でのAPI呼び出し結果を一時キャッシュし、重複呼び出しを避ける。YouTube Analytics APIのdimensions指定で動画別内訳を1クエリで取得し、動画ごとの個別リクエストを行わない。

マッピング層(`mappers.ts`)が生APIレスポンスを `VideoMetric` / `ChannelDailyStats`(ドメイン型)に変換し、以降の層はYouTube固有のフィールド名を一切意識しない。

---

## ⑧ 毎朝分析フロー(バッチ)

1. Vercel Cron(`vercel.json`)が毎朝6:00 JST相当のUTC時刻に `/api/cron/daily-analysis` を起動
2. ルートハンドラは `CRON_SECRET` ヘッダを検証(検証失敗時は401、外部からの不正起動を防止)
3. `runDailyAnalysisForAllChannels()`(application層)が:
   - `isActive=true` の全チャンネルを取得
   - 小さな同時実行数(例: 3並列)でチャンネルごとに `GenerateDailyBriefing` usecaseを実行(API割当を考慮)
   - 各チャンネル処理は独立した try/catch でラップし、1件の失敗が他チャンネルの処理を止めない
   - 当日分Briefingが既に存在する場合はスキップ(冪等性)
   - 全体の実行結果(成功/失敗件数)を `JobRun` に記録
4. 手動再生成エンドポイントは同じusecaseを単一チャンネルに対して呼び出す(失敗時のリトライ導線)

---

## ⑨ エラー処理方針

- エラー階層: `AppError`(基底) → `DomainError` / `ExternalApiError`(`AuthExpiredError`, `QuotaExceededError`, `TimeoutError`等のサブタイプ) / `ValidationError`
- 各Infrastructureアダプタは外部ライブラリの生例外(googleapis, openai SDK等)を必ず上記のAppErrorへ変換してからdomain層へ渡す(生のスタックトレースを上位に漏らさない)
- バッチ処理: チャンネル単位でエラーを分離。部分成功は正常系として扱い、ジョブ全体は例外を投げず `{ succeeded, failed, errors[] }` のサマリを返す
- トークン失効: Google APIから401を受けたら1回だけrefreshを試行。失敗したら `Channel.status = REAUTH_REQUIRED` に更新し、UIで再連携を促す(`ReauthRequiredBanner`)
- OpenAIエラー: 429/5xx系は最大2回まで指数バックオフでリトライ。最終失敗時は `Briefing.status = FAILED` とし、UIには前回分の内容を表示しつつ「最新の分析に失敗しました」と明示
- ロギング: `lib/logger.ts` による構造化ログ(channelId/userId/jobIdをコンテキストに付与)。トークンやAPIキー等のPII/秘匿情報はログに出力しない
- UI状態: 「本日分析待ち」「分析失敗・再試行可能」「連携が必要」を明確に区別し、生のエラーメッセージはユーザーに見せない

---

## ⑩ 将来の拡張方針

- **新プラットフォーム追加(TikTok/Instagram/X)**: `infrastructure/platforms/<platform>/` に `PlatformDataProvider` 実装を追加し、`config/platforms.ts` のレジストリに登録するのみ。`domain/` と大部分のUIコンポーネントは変更不要。
- **AI分析の汎用化**: `AIAnalyzer` ポートはプラットフォームを問わず「正規化コンテキスト→構造化ブリーフィング」を担当。プラットフォーム別に異なるのはシステムプロンプトのみ。
- **UI切り替え**: `PlatformTabs` で「YouTube社員」「TikTok社員」等を切り替え、同じ `BriefingPage` をプラットフォームパラメータで再利用。
- **複数チャンネル対応**: スキーマは既に `Channel` が `User` に対して1:N。MVPでも複数チャンネル連携を制約なく扱える。
- **通知チャネル拡張**: 将来のメール/Slack通知は `NotificationSender` ポートとして分離し、生成ロジックと疎結合に保つ。
- **集計期間の拡張**: 週次/月次ダイジェストは `GenerateBriefing(channel, period)` のように期間パラメータを追加する形で一般化(MVPは `DAILY` 固定)。

---

## 想定環境変数(参考)

```
DATABASE_URL=
DIRECT_URL=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
YOUTUBE_OAUTH_REDIRECT_URI=
OPENAI_API_KEY=
TOKEN_ENCRYPTION_KEY=
CRON_SECRET=
```
