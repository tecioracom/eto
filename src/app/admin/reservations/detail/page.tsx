import type { Metadata } from 'next';
import { EtoAdmin, AdminHead } from '../../../_admin';
import { FEATURED } from '../../../_data';
import { ReservationDetail } from './ReservationDetail';

/* ============================================================================
 * 予約の詳細 `/admin/reservations/detail`。
 *
 * 書き出しでは「予約の詳細」と「保存後」の2画面だったが、実装では
 * **1ルートの2つの状態**にしてある。保存はしないので、完了の画面を別ルートで
 * 持つと、直リンクで「保存しました」だけが開けてしまう。
 * 終点は同じルートの「変更内容の確認」。
 *
 * 予約は表側の流れが最後にたどり着く1件（ET-1003-014）を開いた状態から
 * 始める。予約番号を打って照会する入口は作っていない——当たるまで試せる口を
 * 公開することになるため。
 * ==========================================================================*/

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: `予約 ${FEATURED.id} — éto 店舗管理`,
    description:
      'éto の予約詳細。ステータスと担当、スタッフメモを変え、変更内容の確認まで進めます。保存はされません。',
    alternates: {
      canonical: '/admin/reservations/detail',
    },
    robots: { index: false, follow: false },
  };
}

export default async function ReservationDetailPage() {

  return (
    <EtoAdmin current="detail">
      <AdminHead
        title={`予約 ${FEATURED.id}`}
        lead={`${FEATURED.guest} 様`}
        trailing={
          <a
            href="/admin/calendar"
            className="inline-flex min-h-[44px] items-center text-[13px] text-[var(--sub)] underline underline-offset-4 hover:text-[var(--ink)]"
          >
            &larr; カレンダーに戻る
          </a>
        }
      />
      <ReservationDetail />
    </EtoAdmin>
  );
}
