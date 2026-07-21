# AI Web Studio

「こういうサイトが欲しい」と伝えるだけで、AI制作会社(Interviewer / Director /
Marketing / UX / Designer / Copywriter / Frontend / Reviewer / QA という9つの
独立したAIエージェント)が企画・設計・デザイン・実装・レビューまでを行い、
公開可能な品質のWebサイトを生成するサービスです。

> `Cafe_Lumi_re/` はこのリポジトリに元々あった無関係な静的サイトのサンプルです。
> AI Web Studio本体とは関係ありません。

## アーキテクチャ概要

- **Next.js (App Router) / TypeScript / Tailwind CSS**
- **Vercel AI SDK**: LLM Providerの抽象化(既定はOpenAI。Anthropic/Geminiは差し替え可能な設計のみ用意、未実装)
- **Inngest**: ヒアリングの回答待ち・改善リトライを含む耐久実行ワークフロー
- **Supabase**: 進捗状態の永続化とRealtime配信
- **Vercel Deployments API**: 生成サイトの公開(実装済み・未検証。下記「既知の制約」参照)

```
agents/            9エージェント(各: contract.ts / prompt.ts / index.ts)
core/               ドメインロジック(型・LLM Provider抽象化・ワークフロー・採点)
infra/              外部サービスとの接続(Supabase / Inngest / Vercel Deploy)
components-library/ Frontend Agentの出力を実際に描画するコンポーネント群
components/         チャットUI・shadcn/ui風のUIプリミティブ
inngest/functions/  Workflow Engine本体(9エージェントの呼び出し順序・リトライ制御)
app/                Next.js App Router(チャット画面・プレビュー・APIルート)
```

各Phaseの設計意図は開発時のセッションログに残っている想定ですが、要点は:

- エージェント間は自由対話ではなく、Zodスキーマで定義された入出力のみで連携する
- Frontend Agentは自由にコードを書かず、`components-library`の部品を選択・合成する
- Reviewer(LLM, 主観的な講評)とQA(ツール検査, 客観指標)を分離し、
  QAはWCAGコントラスト比計算やセクション欠落検出など決定的なロジックで採点する
- 改善ループは各ステージ最大2回まで、合格ラインは82点(将来95点に引き上げ可能な設定値)

## セットアップ

```bash
npm install
cp .env.example .env.local
# .env.localに以下を設定
#   OPENAI_API_KEY, OPENAI_MODEL         (LLM呼び出し)
#   NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY
#   INNGEST_EVENT_KEY, INNGEST_SIGNING_KEY
#   VERCEL_API_TOKEN, VERCEL_TEAM_ID(任意), VERCEL_PROJECT_PREFIX(任意)

npm run dev          # 開発サーバー (http://localhost:3000)
npm run test         # vitest
npm run typecheck    # tsc --noEmit
npm run lint         # eslint
npm run build        # production build
```

Supabaseは `infra/supabase/schema.sql` を実行してテーブルを作成してください
(`runs`/`stage_results`のRealtime配信も有効化されます)。

ワークフローをローカルで動かす場合は別途 `npx inngest-cli@latest dev` の起動が必要です。

## 現状と既知の制約

開発は他者(AIエージェント)による対話セッションで、9つのPhaseに分けて進めました。
全Phase実装済みですが、**開発環境にLLM/Supabase/Inngest/Vercelいずれの実クレデンシャルも
無かったため、コード生成・テスト・ビルドは全て通っている一方、実際のAPIに対する
動作確認は一度もできていません。** 特に以下は初回起動時に要確認です。

- **認証が未実装**: Supabase Authによるログイン機能が無く、プロジェクト/runの作成は
  ブラウザ側で生成したIDをそのまま使うデモ動作になっています。`projects`テーブルは
  `owner_id`(auth.usersへの外部キー)が必須のため、実際にSupabaseへ繋いだ場合、
  ログイン機能を追加するか、スキーマの制約を調整するまでチャットの永続化は失敗します
  (失敗してもチャット自体の応答は返る設計にしてあります)。
- **Vercelデプロイ(`infra/deploy/vercel.ts`)は未検証**: 公開されているVercel
  Deployments APIの仕様を基に実装していますが、実際にAPIを叩いたことは一度もありません。
  実トークンで動作確認してください。
- **ヒアリングの会話履歴が永続化されない**: `messages`テーブルは用意していますが、
  現状チャットはブラウザのstateのみで保持しており、リロードで消えます。
- **`requirement.mustHaveSections`(自由記述)とセクション種別(enum)の意味的な
  突き合わせは未実装**です。QAの検査はセクションの構造的な欠落検出はできますが、
  「ヒアリングで要求された項目が実際に反映されているか」の意味的な検証はできません。
- 実際にOpenAI APIキーを設定して9エージェントが意味のある出力を返すか、
  Reviewerの採点が実用的な精度かは未検証です。

## テスト状況

vitest 59件、typecheck・lint・production build、すべてクリーンです
(ユニットテスト・契約テストのみで、実APIへの結合テストは含みません)。
