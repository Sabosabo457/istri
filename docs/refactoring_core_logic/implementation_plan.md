# 実装計画: 核心部のバグ修正とリファクタリング (useRoomData / RoomPage)

「作業通話アプリ」の核心となる `useRoomData` フックと `RoomPage` に潜む、深刻なバグ（リソースリーク、履歴保存の漏れ、Firestore のサイズ制限リスク）を修正し、コードの健全性を高めます。

## ユーザーレビューが必要な項目

> [!IMPORTANT]
> 画像の保存先を **Firestore (Base64)** から **Firebase Storage** へ移行します。これにより、大規模なチャットでも安定して動作するようになります。これに伴い、Firebase プロジェクト側で Storage のルール設定が必要になる場合があります。

## 提案される変更

### 1. [hooks/useRoomData.ts](file:///c:/Users/ntana/Documents/Antigravity_docs/istri/app/(shared)/hooks/useRoomData.ts) のリファクタリング
- **リスナー管理の修正**: `onSnapshot` の解除関数を確実に保持し、アンマウント時やデータ変更時にクリーンアップするように修正します。
- **履歴保存の実装**: 入室成功時に `localStorage` の `istri_history` を更新する処理を追加します。
- **画像アップロードの Storage 移行**: `sendMessage` で画像を受け取った際、Firestore に直接書き込むのではなく、Firebase Storage にアップロードしてからその URL を記録するように変更します。
- **型定義の導入**: `any` を排除し、`Room`, `Member`, `Message` などのインターフェースを定義します。

### 2. [[roomId]/page.tsx](file:///c:/Users/ntana/Documents/Antigravity_docs/istri/app/room/[roomId]/page.tsx) の型安全化
- **フックの戻り値の型適用**: `as any` を削除し、定義した型を使用するように変更します。
- **不要な `compressImage` の整理**: `useRoomData` 側でアップロード処理を統合することを検討します。

### 3. [lib/firebase.ts](file:///c:/Users/ntana/Documents/Antigravity_docs/istri/lib/firebase.ts) の確認
- ストレージ機能が正しくエクスポートされていることを確認（確認済み）。

---

## 現時点での懸念・質問

> [!CAUTION]
> **Firestore のメッセージ削除ルールについて**: 画像を Storage に保存した場合、Firestore のメッセージドキュメントを削除しても Storage 上の画像は残ります。将来的に、メッセージ削除と連動して Storage からも削除する関数（Cloud Functions 等）が必要になるかもしれません。今回はまず、主要な不具合の解消を優先します。

## 検証計画

### 自動テスト（ブラウザシミュレーション）
- 複数のブラウザタブを開き、入室後に「最近いった場所」がホーム画面に正しく表示されるか確認します。
- 画像を送信し、Firebase Storage に保存されていること、チャットに表示されることを確認します。
- ページ遷移を繰り返し、Firestore のリスナーが重複して増えていないか（ブラウザのコンソールやパフォーマンスでチェック）を確認します。

### 手動検証
- 実際に画像ファイルをアップロードし、正常にチャットへ反映されるか確認します。
