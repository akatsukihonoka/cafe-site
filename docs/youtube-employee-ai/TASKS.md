# YouTube社員AI - 実装タスク一覧(MVP)

各タスクは1時間以内で完了できる粒度に分割。実装順はPhase 0→8の順に進めることを推奨(依存関係順)。

凡例: 目的 / 実装内容 / 完了条件 / テスト内容

---

## Phase 0: プロジェクトセットアップ

### 0-1. Next.jsプロジェクト初期化
- 目的: 開発の土台を作る
- 実装内容: `create-next-app` でTypeScript + App Router + TailwindCSS構成を初期化。ESLint標準設定を含める
- 完了条件: `npm run dev` でデフォルトページが起動する
- テスト内容: ローカルで起動確認のみ(自動テスト不要)

### 0-2. ESLint/Prettier設定
- 目的: コード品質の一貫性を保つ
- 実装内容: ESLint/Prettierのルール調整、import順序ルール、`husky`+`lint-staged`でコミット時lint
- 完了条件: `npm run lint` がエラーなく通る。コミット時に自動lintが走る
- テスト内容: わざとlintエラーのあるコードをコミットしてフックが止めることを確認

### 0-3. ディレクトリ雛形作成(Clean Architecture骨格)
- 目的: DESIGN.mdのディレクトリ構成を実体化する
- 実装内容: `src/domain`, `src/application`, `src/infrastructure`, `src/lib`, `src/config` 配下に空のindex/READMEプレースホルダーを作成
- 完了条件: DESIGN.md記載の全ディレクトリが存在する
- テスト内容: 不要(構造確認のみ)

### 0-4. 環境変数バリデーション基盤
- 目的: 環境変数の設定ミスを起動時に検知する
- 実装内容: `src/lib/env.ts` にzodスキーマで必須環境変数を定義。`.env.example` 作成
- 完了条件: 必須変数が欠けている場合、アプリ起動時に明確なエラーで落ちる
- テスト内容: 変数を1つ欠いた状態で起動し、エラーメッセージを確認するユニットテスト

### 0-5. Vercelプロジェクト作成・接続
- 目的: デプロイ先を用意する
- 実装内容: Vercelプロジェクト作成、GitHubリポジトリ連携、Preview環境の自動デプロイ設定
- 完了条件: mainブランチpushでPreviewが自動生成される
- テスト内容: ダミーコミットをpushしてデプロイが成功することを確認

### 0-6. CI最低限構築
- 目的: 品質ゲートを自動化する
- 実装内容: GitHub Actions(または Vercel標準)でlint + typecheckを実行するワークフロー追加
- 完了条件: PR作成時にCIが自動実行される
- テスト内容: わざと型エラーのあるPRを作りCIが失敗することを確認

---

## Phase 1: 認証基盤

### 1-1. Supabaseプロジェクト作成・Google OAuth設定
- 目的: 認証基盤を用意する
- 実装内容: Supabaseプロジェクト作成、Auth設定でGoogle Providerを有効化(Client ID/Secret登録)
- 完了条件: Supabase管理画面でGoogleログインのテストが成功する
- テスト内容: Supabase管理画面のテストログイン機能で確認

### 1-2. Supabase SSRクライアントセットアップ
- 目的: Next.js App RouterでSupabaseセッションを扱えるようにする
- 実装内容: `infrastructure/auth/supabaseAuthClient.ts` にサーバー/クライアント両対応のSupabaseクライアントを実装
- 完了条件: サーバーコンポーネントからセッション情報を取得できる
- テスト内容: サーバーコンポーネントでセッションのnull/非nullをログ出力し確認

### 1-3. ログインページUI実装
- 目的: ユーザーがログインできる入口を作る
- 実装内容: `app/(auth)/login/page.tsx` と `LoginButton` コンポーネント実装
- 完了条件: ボタン押下でGoogle同意画面へ遷移する
- テスト内容: 手動E2E(ボタンクリック→Google画面遷移確認)

### 1-4. OAuthコールバック実装
- 目的: ログイン後にセッションを確立する
- 実装内容: `app/(auth)/callback/route.ts` でSupabaseのコード交換処理を実装
- 完了条件: ログイン後にセッションCookieが設定され、ダッシュボードへリダイレクトされる
- テスト内容: 手動E2Eでログイン全フローを確認

### 1-5. 認証ガードmiddleware実装
- 目的: 未ログインユーザーの保護ページアクセスを防ぐ
- 実装内容: `middleware.ts` で `(dashboard)` 配下への未認証アクセスをloginへリダイレクト
- 完了条件: 未ログイン状態で `/` にアクセスすると `/login` へ飛ぶ
- テスト内容: Cookie削除状態でダッシュボードURLに直接アクセスするテスト(integration)

### 1-6. ログアウト機能実装
- 目的: セッション終了手段を提供する
- 実装内容: `Header` にログアウトボタン、Supabase `signOut()` 呼び出し
- 完了条件: ログアウト後にloginページへ戻り、再アクセスがガードされる
- テスト内容: 手動確認 + ガードのテスト再実行

### 1-7. Userレコード同期usecase実装
- 目的: アプリ内DBとSupabase Authユーザーを紐付ける
- 実装内容: `domain/usecases`にログイン後のUser upsert処理、`UserRepository`ポート定義とPrisma実装
- 完了条件: 初回ログイン時に `User` テーブルへレコードが1件作成される
- テスト内容: ユニットテスト(upsertロジック)+ integrationテスト(実DB確認)

---

## Phase 2: DB設計・Prisma

### 2-1. Prisma初期化・Supabase接続確認
- 目的: ORMとDBの疎通を確立する
- 実装内容: `prisma init`、`DATABASE_URL`/`DIRECT_URL`設定、接続確認スクリプト作成
- 完了条件: `npx prisma db pull` または簡易クエリが成功する
- テスト内容: 接続確認スクリプトの実行結果を確認

### 2-2. User/Channelモデル定義
- 目的: 認証・連携チャンネルの永続化スキーマを用意する
- 実装内容: `schema.prisma` に `User`, `Channel`, `PlatformType`, `ChannelStatus` enumを定義
- 完了条件: `prisma validate` が通る
- テスト内容: スキーマバリデーションコマンド実行

### 2-3. Briefingモデル定義
- 目的: 分析結果の永続化スキーマを用意する
- 実装内容: `Briefing` モデル + `BriefingStatus` enum、`(channelId, targetDate)` unique制約を追加
- 完了条件: `prisma validate` が通る
- テスト内容: スキーマバリデーションコマンド実行

### 2-4. VideoMetricSnapshot/JobRunモデル定義
- 目的: 履歴データとバッチ実行監視のスキーマを用意する
- 実装内容: 両モデルを定義し、必要なunique制約・indexを追加
- 完了条件: `prisma validate` が通る
- テスト内容: スキーマバリデーションコマンド実行

### 2-5. マイグレーション作成・適用
- 目的: スキーマを実DBに反映する
- 実装内容: `prisma migrate dev` でマイグレーションファイル生成、Supabaseへ適用
- 完了条件: Supabase側にテーブルが作成されている
- テスト内容: Supabaseダッシュボードでテーブル存在確認 + `prisma studio` で確認

### 2-6. Repositoryポート定義
- 目的: ドメイン層をDB実装から分離する
- 実装内容: `domain/ports` に `UserRepository`, `ChannelRepository`, `BriefingRepository` インターフェースを定義
- 完了条件: 型定義のみでコンパイルが通る
- テスト内容: 型チェック(`tsc --noEmit`)

### 2-7. Prisma版Repository実装
- 目的: ポートの具体実装を用意する
- 実装内容: `infrastructure/db` に各Repositoryインターフェースの実装クラスを作成
- 完了条件: 各メソッド(CRUD)がテスト用DBで動作する
- テスト内容: integrationテスト(実DBへのcreate/find/update確認)

---

## Phase 3: YouTube連携

### 3-1. Google Cloud Console設定
- 目的: YouTube API利用の前提を整える
- 実装内容: GCPプロジェクト作成、YouTube Data API v3 / YouTube Analytics API有効化、OAuth同意画面設定、認証情報発行
- 完了条件: Client ID/Secretが取得でき、`.env` に設定済み
- テスト内容: GCPコンソール上でAPI有効化状態を確認

### 3-2. チャンネル連携OAuth開始エンドポイント実装
- 目的: YouTubeスコープでの同意画面遷移を実現する
- 実装内容: `app/api/channels/connect/route.ts` でstate発行 + scopes付きGoogle認可URL生成・リダイレクト
- 完了条件: エンドポイントアクセスでGoogle同意画面(YouTubeスコープ)へ遷移する
- テスト内容: 手動確認(リダイレクト先URLのscopesパラメータ確認)

### 3-3. トークン暗号化ユーティリティ実装
- 目的: アクセストークンを安全に保存する
- 実装内容: `lib/crypto.ts` にAES等での暗号化/復号関数を実装
- 完了条件: 暗号化→復号で元の文字列に戻ることを確認
- テスト内容: ユニットテスト(暗号化・復号の往復確認)

### 3-4. チャンネル連携コールバック実装
- 目的: トークン交換とChannel保存を行う
- 実装内容: `app/api/channels/connect/callback/route.ts` でコード交換、YouTube Data APIでチャンネル基本情報取得、`Channel`をupsert(暗号化トークン込み)
- 完了条件: 連携後、DBに暗号化済みトークン付きChannelレコードが作成される
- テスト内容: integrationテスト(モックOAuthレスポンスでのDB保存確認)

### 3-5. TokenRefresher実装
- 目的: 期限切れトークンを自動更新する
- 実装内容: `infrastructure/platforms/youtube` にトークン有効期限チェック+refresh_tokenでの更新処理を実装
- 完了条件: 期限切れトークンを持つChannelに対し、API呼び出し前に自動更新される
- テスト内容: ユニットテスト(モックで期限切れ→更新呼び出し確認)、リフレッシュ失敗時にREAUTH_REQUIREDへ遷移するテスト

### 3-6. PlatformDataProviderインターフェース定義
- 目的: プラットフォーム非依存のデータ取得契約を定義する
- 実装内容: `domain/ports/PlatformDataProvider.ts` に `getChannelProfile`, `getYesterdayStats` 等のメソッドシグネチャを定義
- 完了条件: 型定義のみでコンパイルが通る
- テスト内容: 型チェック

### 3-7. YouTubeDataApiClient実装
- 目的: チャンネル基本情報を取得する
- 実装内容: `youtubeDataApiClient.ts` に `channels.list` 呼び出しラッパーを実装
- 完了条件: 実チャンネルIDで基本情報(名前・サムネイル等)が取得できる
- テスト内容: integrationテスト(実APIまたはモックでレスポンス形式確認)

### 3-8. YouTubeAnalyticsApiClient実装
- 目的: 日次メトリクスを取得する
- 実装内容: `youtubeAnalyticsApiClient.ts` に `reports.query` 呼び出し(dimensions=video、views/watchTime/subscribers等の指標指定)を実装
- 完了条件: 指定日のチャンネル全体+動画別メトリクスが1クエリで取得できる
- テスト内容: integrationテスト(実APIまたはモックでレスポンス形式・件数確認)

### 3-9. YouTubeDataProvider実装(マッピング含む)
- 目的: PlatformDataProviderインターフェースを実装しドメイン型へ変換する
- 実装内容: `YouTubeDataProvider.ts` + `mappers.ts` で生APIレスポンスを `VideoMetric`/`ChannelDailyStats` に変換
- 完了条件: ドメイン型の配列/オブジェクトとして正しい値が返る
- テスト内容: ユニットテスト(マッピング関数の入出力確認、境界値含む)

### 3-10. チャンネル連携UI実装
- 目的: ユーザーが連携操作を行えるようにする
- 実装内容: `ChannelConnectCard` コンポーネント、settings画面への組み込み
- 完了条件: 未連携時にカードが表示され、連携後はチャンネル名が表示される
- テスト内容: 手動E2E(連携→表示確認)

### 3-11. チャンネル切断機能実装
- 目的: 連携解除の手段を提供する
- 実装内容: `DELETE /api/channels/:id` + UI側の解除ボタン、`Channel.status = DISCONNECTED` への更新
- 完了条件: 解除操作後、該当チャンネルがバッチ対象から除外される
- テスト内容: integrationテスト(解除後に`isActive=false`となることを確認)

---

## Phase 4: AI分析エンジン

### 4-1. AIAnalyzerインターフェース定義
- 目的: AI分析のプラットフォーム非依存な契約を定義する
- 実装内容: `domain/ports/AIAnalyzer.ts` に `generateBriefing(context): Promise<BriefingContent>` を定義
- 完了条件: 型定義のみでコンパイルが通る
- テスト内容: 型チェック

### 4-2. プロンプトテンプレート設計
- 目的: AIに一貫した出力形式を生成させる
- 実装内容: システムプロンプト(「YouTube担当社員」ペルソナ)と、正規化コンテキストを埋め込むテンプレート関数を作成
- 完了条件: サンプルデータでプロンプト文字列が正しく生成される
- テスト内容: ユニットテスト(テンプレート関数のスナップショットテスト)

### 4-3. AI出力用zodスキーマ定義
- 目的: AI応答の構造を保証する
- 実装内容: `{ yesterdaySummary, todos[], suggestions[] }` のzodスキーマ定義
- 完了条件: 正常なJSONはパース成功、不正な形は失敗する
- テスト内容: ユニットテスト(正常系・異常系のパース確認)

### 4-4. OpenAIAnalyzer実装
- 目的: 実際にAI分析を実行する
- 実装内容: OpenAI APIをStructured Output(JSON Schema)モードで呼び出す実装
- 完了条件: サンプルコンテキストから期待するJSON構造が返る
- テスト内容: integrationテスト(実APIまたはモックでの応答形式確認)

### 4-5. AI出力バリデーション&リトライロジック実装
- 目的: 不正な出力による障害を防ぐ
- 実装内容: zodバリデーション失敗時に1回だけ厳格な再指示プロンプトで再試行するロジック
- 完了条件: 不正応答をモックした際、再試行が1回行われ、それでも失敗すればFAILEDとして扱われる
- テスト内容: ユニットテスト(モックで1回目失敗→2回目成功/失敗の両パターン確認)

### 4-6. GenerateDailyBriefing usecase実装
- 目的: メトリクス取得〜AI分析〜保存を1つの処理にまとめる
- 実装内容: `FetchChannelMetrics` → コンテキスト生成 → `AIAnalyzer.generateBriefing` → `BriefingRepository.save` の統合usecase実装
- 完了条件: 1チャンネル分の日次ブリーフィングがDBに保存される
- テスト内容: integrationテスト(モックProvider/Analyzerを使ったEnd-to-Endのusecaseテスト)

### 4-7. AI分析関連の単体テスト整備
- 目的: 回帰を防ぐ
- 実装内容: プロンプト生成・バリデーション・マッピング関数のテストケース拡充
- 完了条件: 主要な分岐(正常/異常/境界値)のカバレッジが確保される
- テスト内容: `npm test` でPhase4関連テストが全て通る

---

## Phase 5: 毎朝分析バッチ(Cron)

### 5-1. Vercel Cron設定・CRON_SECRET検証実装
- 目的: 毎朝の自動起動を実現する
- 実装内容: `vercel.json` にcronスケジュール追加、ルートハンドラでシークレットヘッダ検証を実装
- 完了条件: 不正なシークレットでは401、正しいシークレットでは処理が進む
- テスト内容: integrationテスト(正しい/誤ったシークレットでのレスポンス確認)

### 5-2. 全チャンネル走査バッチの骨格実装
- 目的: 複数チャンネルを順次/並列処理する基盤を作る
- 実装内容: `runDailyAnalysisForAllChannels()` にactive channel取得+小さな同時実行数での処理ループを実装
- 完了条件: 複数チャンネルに対して`GenerateDailyBriefing`が呼ばれる
- テスト内容: integrationテスト(モックチャンネル3件で全件処理されることを確認)

### 5-3. チャンネル毎エラー分離処理実装
- 目的: 1件の失敗が全体を止めないようにする
- 実装内容: 各チャンネル処理をtry/catchでラップし、失敗を配列に集約
- 完了条件: 1チャンネルが例外を投げても他チャンネルの処理が継続する
- テスト内容: ユニットテスト(1件だけ失敗するモックで残りが成功することを確認)

### 5-4. JobRunロギング実装
- 目的: バッチ実行の可観測性を確保する
- 実装内容: バッチ開始/終了時に`JobRun`レコードを作成・更新(成功/失敗件数、所要時間記録)
- 完了条件: バッチ実行後、`JobRun`テーブルに実行結果が記録される
- テスト内容: integrationテスト(実行後のJobRunレコード内容確認)

### 5-5. 冪等性実装(当日分重複防止)
- 目的: 同日に複数回実行されても重複生成しないようにする
- 実装内容: `Briefing`のupsert処理、既存かつCOMPLETED済みの場合はスキップするロジック
- 完了条件: 同じチャンネル・同じ日付で2回実行しても1件しか残らない
- テスト内容: integrationテスト(同一usecaseを2回呼び出しレコード数を確認)

### 5-6. 手動再生成エンドポイント実装
- 目的: 失敗時や任意タイミングでの再実行手段を提供する
- 実装内容: `POST /api/briefings/:channelId/regenerate` + レート制限(例: 1時間に1回)実装
- 完了条件: 通常は再生成でき、制限時間内の連続呼び出しは429を返す
- テスト内容: integrationテスト(正常系1回目成功、2回目レート制限で失敗)

---

## Phase 6: UI実装

### 6-1. AppShell/Header/Sidebar実装
- 目的: 全体レイアウトの土台を作る
- 実装内容: `components/layout` にAppShell, Header, Sidebar(将来のPlatformTabsのプレースホルダー含む)を実装
- 完了条件: ログイン後の全ページで共通レイアウトが表示される
- テスト内容: 手動確認(表示崩れがないか)

### 6-2. ダッシュボードページ雛形実装
- 目的: メイン画面のデータ取得経路を作る
- 実装内容: `app/(dashboard)/page.tsx`(Server Component)で`briefingService`から今日のBriefingを取得
- 完了条件: 未生成/生成済みの両状態でページがエラーなく描画される
- テスト内容: integrationテスト(データありなしの両パターンでレンダリング確認)

### 6-3. BriefingHeader実装
- 目的: 対象日・チャンネル名・再生成操作を表示する
- 実装内容: `BriefingHeader` コンポーネント実装、再生成ボタンにローディング状態を実装
- 完了条件: ボタン押下でAPIが呼ばれ、処理中はスピナー表示される
- テスト内容: コンポーネントテスト(クリックイベントでAPI呼び出しがトリガーされることを確認)

### 6-4. YesterdaySummaryCard実装
- 目的: 昨日のサマリーを視覚的に提示する
- 実装内容: 再生回数・登録者増減・トップ動画等を表示するカードコンポーネント実装
- 完了条件: ドメイン型`Briefing`を渡すと正しく値が表示される
- テスト内容: コンポーネントテスト(スナップショット+主要数値の表示確認)

### 6-5. TodayTodoList実装
- 目的: 今日やるべきことを提示する
- 実装内容: チェックリスト形式のUIコンポーネント実装(チェック状態はローカルstateのみ、MVPでは永続化しない)
- 完了条件: TODO配列がリスト表示され、チェック操作ができる
- テスト内容: コンポーネントテスト(チェック操作での見た目変化確認)

### 6-6. ImprovementSuggestionList実装
- 目的: 改善提案を優先度付きで提示する
- 実装内容: 優先度バッジ付きの提案カードリスト実装
- 完了条件: 提案配列が優先度順に表示される
- テスト内容: コンポーネントテスト(ソート順・バッジ表示確認)

### 6-7. Loading/Empty/Error状態コンポーネント実装
- 目的: 各状態で適切なフィードバックを提示する
- 実装内容: `LoadingSkeleton`, `EmptyState`, `ErrorState`, `ReauthRequiredBanner` を実装しダッシュボードに組み込む
- 完了条件: 4状態それぞれが正しい条件で表示切替される
- テスト内容: コンポーネントテスト(props/状態別の表示分岐確認)

### 6-8. 履歴ページ実装
- 目的: 過去の分析結果を振り返れるようにする
- 実装内容: `app/(dashboard)/history/page.tsx` + `BriefingHistoryList`/`BriefingHistoryItem` 実装、カーソルページング対応
- 完了条件: 過去分の一覧が新しい順に表示され、詳細を開ける
- テスト内容: integrationテスト(複数件データでの一覧・ページング確認)

### 6-9. Settings画面実装
- 目的: チャンネル連携・アカウント管理を一箇所にまとめる
- 実装内容: `app/(dashboard)/settings/page.tsx` に`ChannelConnectCard`/`AccountSettingsForm`を統合
- 完了条件: 連携・解除・ログアウト操作がこの画面から行える
- テスト内容: 手動E2E(一連の操作確認)

### 6-10. レスポンシブ・Tailwindテーマ調整
- 目的: モバイル含む表示品質を整える
- 実装内容: `tailwind.config.ts`のテーマ定義、主要画面のブレークポイント調整
- 完了条件: モバイル幅でも主要画面が崩れず表示される
- テスト内容: 手動確認(主要ブレークポイントでのビジュアル確認)

---

## Phase 7: エラー処理・運用

### 7-1. AppErrorクラス階層実装
- 目的: エラーを型安全に分類する
- 実装内容: `lib/errors.ts` に `AppError`, `DomainError`, `ExternalApiError`(サブタイプ含む), `ValidationError` を実装
- 完了条件: 各エラークラスがinstanceofで判別できる
- テスト内容: ユニットテスト(エラー生成・継承関係の確認)

### 7-2. Infra層でのエラー変換実装
- 目的: 外部ライブラリの生例外を漏らさない
- 実装内容: YouTube/OpenAI呼び出し箇所でtry/catchし、AppErrorサブクラスへ変換
- 完了条件: モックで意図的に外部エラーを発生させた際、AppErrorとして伝播する
- テスト内容: ユニットテスト(各アダプタのエラー変換確認)

### 7-3. 構造化ロガー実装
- 目的: 運用時のトラブルシュートを容易にする
- 実装内容: `lib/logger.ts` にchannelId/userId/jobId等のコンテキストを付与できるロガー実装
- 完了条件: ログにコンテキスト情報が含まれ、秘匿情報が出力されない
- テスト内容: ユニットテスト(ログ出力内容にトークン等が含まれないことを確認)

### 7-4. 再認証必要UI実装
- 目的: トークン失効時にユーザーへ明確に案内する
- 実装内容: `ReauthRequiredBanner`をダッシュボードに組み込み、`Channel.status`に応じて表示
- 完了条件: `REAUTH_REQUIRED`状態のチャンネルでバナーが表示され、再連携導線がある
- テスト内容: integrationテスト(状態別のバナー表示確認)

### 7-5. グローバルエラーバウンダリ実装
- 目的: 予期しない例外でアプリ全体が壊れないようにする
- 実装内容: `app/error.tsx` 実装、ユーザー向けフォールバックUI
- 完了条件: 意図的な例外発生時にフォールバック画面が表示される
- テスト内容: 手動確認(強制エラーでの表示確認)

---

## Phase 8: テスト整備・デプロイ

### 8-1. 主要usecaseユニットテスト整備
- 目的: ビジネスロジックの回帰を防ぐ
- 実装内容: `GenerateDailyBriefing`, `ConnectChannel`, `RegenerateBriefing` 等の主要usecaseテストを整備
- 完了条件: 主要usecaseにテストが存在し全て通る
- テスト内容: `npm test`実行結果確認

### 8-2. E2Eテスト(基本フロー)実装
- 目的: ログイン〜連携〜ダッシュボード表示の一連動作を保証する
- 実装内容: Playwrightで「ログイン→チャンネル連携→ダッシュボード表示」の基本シナリオを実装
- 完了条件: E2Eテストがローカル/CIで安定して通る
- テスト内容: Playwrightテスト実行結果確認

### 8-3. 本番環境変数設定・デプロイ確認
- 目的: 本番稼働の準備を整える
- 実装内容: Vercel本番環境に全環境変数を設定し、本番デプロイを実行
- 完了条件: 本番URLでログイン〜ダッシュボード表示までが動作する
- テスト内容: 手動スモークテスト(本番環境での主要導線確認)

### 8-4. Cron本番動作確認
- 目的: 毎朝バッチが本番で正しく起動することを確認する
- 実装内容: Vercel Cronの本番スケジュール確認、手動トリガーでの動作確認
- 完了条件: 本番で1回分の`JobRun`が正常に記録される
- テスト内容: 手動確認(Vercelログ・DBのJobRunレコード確認)

---

## 補足: 実装順の推奨理由

1. **Phase 0-2(基盤・認証・DB)を最初に固める**: 以降のすべての機能がこの上に乗るため、ここが不安定だと手戻りが大きい。
2. **Phase 3(YouTube連携)を先にAI分析より前に完了させる**: 実データが取得できないとAI分析のテストが形骸化するため。
3. **Phase 4(AI分析)はPhase 3完了後に着手**: 正規化済みメトリクスが前提となるため。
4. **Phase 5(バッチ)はPhase 3・4の統合**: 個別コンポーネントが揃ってから組み上げる。
5. **Phase 6(UI)は並行着手可能だが、データ層のモックが必要**: 早期にUIモックアップを進めたい場合はダミーデータで先行実装しても良い。
6. **Phase 7(エラー処理)は各Phaseに部分的に組み込みつつ、最後に横断的に総仕上げ**。
7. **Phase 8(テスト・デプロイ)は最後に全体統合確認**。
