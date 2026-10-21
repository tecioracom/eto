import type { Metadata } from 'next';
import { AdminCard, AdminStat } from '@/components/site/AdminShell';
import { EtoAdmin, AdminHead } from '../../_admin';
import {
  FEATURED_ID,
  SLOTS,
  STAFF,
  bookedCount,
  firstTimeCount,
  openCount,
  timeRange,
} from '../../_data';

/* ============================================================================
 * 予約カレンダー `/admin/calendar`。
 *
 * ■ サロンで最初に開くのは、その日の埋まり方
 *   だから最初の面を担当者3名 × 11:00–16:00 の表に使い切る。
 *   上の3つの数（本日の予約・空き枠・初めてのお客様）は**表から数えている**。
 *   定数で書くと、枠を1つ直したときに数字だけが古いまま残る。
 *
 * ■ 「施術中」は予約の件数に数えない
 *   前の枠から続いている時間なので、数えると1件が2件に見える。
 *   `_data.ts` の bookedCount() は kind === 'booked' だけを数えている。
 *
 * ■ 空いている枠には「予約可」と書く
 *   空白のままだと、まだ表が読み込まれていないのか、空いているのかが
 *   区別できない。色だけで伝えない。
 * ==========================================================================*/

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: '予約カレンダー — éto 店舗管理',
    description:
      'éto の予約カレンダー。担当者3名 × 11:00–16:00 の枠と、本日の予約・空き枠・初めてのお客様。',
    alternates: { canonical: '/admin/calendar' },
    robots: { index: false, follow: false },
  };
}

const CELL_BASE =
  'block min-h-[64px] rounded-[2px] px-3 py-2 text-[12px] leading-[1.6]';

export default async function CalendarPage() {

  const detailHref = `/admin/reservations/detail`;

  return (
    <EtoAdmin current="calendar">
      <AdminHead
        title="予約カレンダー"
        lead="担当者ごとの空き時間と予約を確認できます。"
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <AdminStat
          label="本日の予約"
          value={String(bookedCount())}
          unit="件"
          note="施術中（前の枠の続き）は数えていません"
        />
        <AdminStat
          label="空き枠"
          value={String(openCount())}
          unit="枠"
          note="予約可と表示している枠"
        />
        <AdminStat
          label="初めてのお客様"
          value={String(firstTimeCount())}
          unit="名"
          note="カウンセリングの時間を長めに"
        />
      </div>

      <AdminCard className="mt-6">
        <div className="site-scroll-x">
          <table className="w-full min-w-[720px] border-collapse text-left">
            <thead>
              <tr>
                <th
                  scope="col"
                  className="w-[88px] whitespace-nowrap border-b border-[var(--line)] px-3 py-2 text-[12px] font-semibold text-[var(--sub)]"
                >
                  時間
                </th>
                {STAFF.map((s) => (
                  <th
                    key={s.id}
                    scope="col"
                    className="whitespace-nowrap border-b border-[var(--line)] px-3 py-2 text-[12px] font-semibold text-[var(--sub)]"
                  >
                    {s.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {SLOTS.map((row) => (
                <tr key={row.time}>
                  <th
                    scope="row"
                    className="eto-num whitespace-nowrap border-b border-[var(--line)] px-3 py-3 text-left text-[13px] font-semibold text-[var(--ink)]"
                  >
                    {row.time}
                  </th>
                  {row.cells.map((c, i) => (
                    <td
                      key={STAFF[i].id}
                      className="border-b border-[var(--line)] px-2 py-2 align-top"
                    >
                      {c.kind === 'booked' ? (
                        c.id === FEATURED_ID ? (
                          <a
                            href={detailHref}
                            className={`${CELL_BASE} bg-[var(--soft)] text-[var(--soft-ink)] underline underline-offset-4`}
                          >
                            <span className="block font-semibold">{c.guest}</span>
                            <span className="block">{c.what}</span>
                            <span className="eto-num block">
                              {timeRange(row.time, c.minutes)}
                            </span>
                          </a>
                        ) : (
                          <span
                            className={`${CELL_BASE} bg-[var(--soft)] text-[var(--soft-ink)]`}
                          >
                            <span className="block font-semibold">{c.guest}</span>
                            <span className="block">
                              {c.what} <span className="eto-num">{c.minutes}分</span>
                            </span>
                          </span>
                        )
                      ) : c.kind === 'open' ? (
                        <span
                          className={`${CELL_BASE} border border-dashed border-[var(--line-strong)] text-[var(--ink)]`}
                        >
                          予約可
                        </span>
                      ) : (
                        <span
                          className={`${CELL_BASE} bg-[var(--cream)] text-[var(--sub)]`}
                        >
                          {c.kind === 'busy' ? '施術中' : '休憩'}
                        </span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-[12px] leading-[1.8] text-[var(--sub)]">
          「施術中」は前の枠から続いている時間です。お客様側で選んだ
          「山田 花子 様 / ワンカラー＋他店オフ / 14:00–15:30」は、佐々木の
          14:00 の枠に同じ内容で入っています（押すと予約詳細が開きます）。
        </p>
      </AdminCard>
    </EtoAdmin>
  );
}
