import type { Metadata } from 'next';
import { EtoAdmin, AdminHead } from '../../_admin';
import { MenuBoard } from './MenuBoard';

/* ============================================================================
 * メニュー・予約枠 `/admin/menu`。
 *
 * 書き出しでは「メニュー・予約枠」と「保存後」の2画面だったが、実装では
 * **1ルートの2つの状態**にしてある。保存はしないので、完了の画面を別ルートで
 * 持つと、直リンクで「保存しました」だけが開けてしまう。
 * 終点は同じルートの「変更内容の確認」。
 *
 * 書き出しは3つだが、メニューは5つあるので5つとも出している。
 * 一覧に出ないメニューがあると、そこだけ枠を直せない。
 * ==========================================================================*/

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'メニュー・予約枠 — éto 店舗管理',
    description:
      'éto のメニューの料金と施術時間。「60分 / ¥6,600」を1つの欄で直します。保存はされません。',
    alternates: { canonical: '/admin/menu' },
    robots: { index: false, follow: false },
  };
}

export default async function AdminMenuPage() {

  return (
    <EtoAdmin current="menu">
      <AdminHead
        title="メニュー・予約枠"
        lead="メニューの料金と施術時間を変更できます。2つは対で動きます。"
      />
      <MenuBoard />
    </EtoAdmin>
  );
}
