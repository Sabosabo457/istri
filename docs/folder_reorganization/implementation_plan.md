# 実装計画: フォルダ構成の整理と冗長性の排除

プロジェクトの規模拡大に伴い、管理しやすく拡張性の高いフォルダ構成に再編します。また、重複しているロジックやコンポーネントを特定し、共通化を図ります。

## ユーザーレビューが必要な項目

> [!IMPORTANT]
> フォルダ構成の変更により、インポートパス（`@/lib/...` など）が広範囲に変更されます。ビルドエラーを防ぐため、一括して修正を行います。

## フォルダ再編の提案

現在の `app/(shared)` や `app/room/[roomId]/components` を、より標準的な構成に統合します。

### 新しいフォルダ構成案
- **`hooks/`**: カスタムフック (`useRoomData.ts`) を配置。
- **`components/`**: 
  - `shared/`: 全画面共通 (`InAppBrowserBanner.tsx`)
  - `ui/`: 汎用的なUIパーツ（ボタン、入力フォームなど）
  - `room/`: 部屋専用のコンポーネントとモーダル（`app/room/...` から移動）
- **`types/`**: 型定義ファイルを一括管理 (`index.ts`)。
- **`lib/`**: 外部ライブラリ初期化（`firebase.ts`）。
- **`utils/`**: ユーティリティ関数 (`formatElapsed.ts`, `compressImage.ts`)。

---

## 冗長性・非効率な箇所の分析 (現状)

1.  **型定義の重複**: 
    - `useRoomData.ts` と 各UIコンポーネントで似たような型（`Member`, `Message`）が使われており、`as any` が残っている箇所もあります。
2.  **UIパターンの共通化不足**:
    - ホーム画面 (`page.tsx`) と 入室画面の「ロゴ表示」や「配色パターン」が個別に実装されています。これらを `BrandHeader` のような共通コンポーネントへ切り出せます。
3.  **画像圧縮ロジックの分散**:
    - `compressImage` は `lib/utils.ts` にありますが、プロファイル画像の変更時など、各所で個別に呼び出されています。これを `useImageUpload` のようなフックに集約できます。
4.  **Firebase 認証の監視**:
    - 各ページ (`Home`, `Onboarding`, `RoomPage`) で `onAuthStateChanged` を個別に実装しています。これを `AuthContext` または `useAuth` フックで一元管理することで、無駄なリスナーを削減できます。

---

## 実行ステップ

### Phase 1: 基盤ディレクトリの作成と型定義の集約
1.  `hooks/`, `types/`, `components/`, `utils/` などの主要ディレクトリを作成。
2.  `useRoomData.ts` 内のインターフェースを `types/index.ts` へ移動し、プロジェクト全体で共有。

### Phase 2: コンポーネントの再配置
1.  `app/(shared)` を `components/shared` に移動。
2.  `app/room/[roomId]/components` を `components/room` に移動。
3.  インポートパスをすべて更新。

### Phase 3: 冗長ロジックの共通化 (Refactoring)
1.  `useAuth` フックを作成し、各ページの認証チェックを統合。
2.  共通 UI（ロゴ、ボタン）をコンポーネント化し、`page.tsx` をスリム化。

---

## 検証計画
- `npm run build` を実行し、インポートパスのミスによるビルドエラーがないか確認。
- ページ遷移 (`/` → `/room/[id]`) が正常に行え、データが引き継がれているか確認。
- 認証状態（ログイン/ログアウト）が各ページで正しく同期されているか確認。
