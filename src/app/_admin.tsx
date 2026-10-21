import type { ReactNode } from 'react';
import { AdminShell } from '@/components/site/AdminShell';
import { SiteFooter } from '@/components/site/SiteFooter';
import { formatLongJa } from '@/components/site/calendar';
import { Wordmark } from './_ui';
import { STAFF, STAFF_ON_DUTY, TODAY } from './_data';

/* ============================================================================
 * éto の管理画面の器。共有の AdminShell に、このサロンぶんの中身を入れる。
 *
 * 表側（グレージュの地・欧文のディドー）とは別の器にしてある。サロンが朝
 * いちばんに開く画面なので、余白を詰め、面をカードに割り、濃い李色の
 * サイドバーで縦の位置を固定する。**白い汎用ダッシュボードには寄せない。**
 *
 * サイドバーの地は `--green`（＝このサロンでは濃い李）。押すボタンは
 * `--accent`（＝中間の紫）で、2つを別の変数に分けてある。
 * 共有側に固定色を足さないため。
 * ==========================================================================*/

export type AdminPage = 'calendar' | 'detail' | 'menu';

export function EtoAdmin({
  current,
  children,
}: {
  current: AdminPage;
  children: ReactNode;
}) {
  const base = `/admin`;
  return (
    <>
      <div className="sample-body sample-eto">
        <AdminShell
          brand={<Wordmark size="sm" tone="cream" />}
          brandSub="店舗管理"
          nav={[
            {
              label: '予約カレンダー',
              href: `${base}/calendar`,
              current: current === 'calendar',
            },
            {
              label: '予約詳細',
              href: `${base}/reservations/detail`,
              current: current === 'detail',
            },
            {
              label: 'メニュー・枠',
              href: `${base}/menu`,
              current: current === 'menu',
            },
          ]}
          footNote={
            <>
              <p>担当 {STAFF.length}名</p>
              <p className="mt-1">
                <a
                  href="/"
                  className="underline underline-offset-4"
                >
                  サロンのサイトを開く
                </a>
              </p>
              <p className="mt-1">
                <a href={base} className="underline underline-offset-4">
                  ログアウト
                </a>
              </p>
            </>
          }
          crumb={formatLongJa(TODAY)}
          meta={<span>{STAFF_ON_DUTY}</span>}
        >
          {children}
        </AdminShell>
      </div>
      {/* Teciora の帯。**配色スコープの外**に置く（[8] が全ページで見ている）。 */}
      <SiteFooter />
    </>
  );
}

/** 画面の見出し（管理側）。 */
export function AdminHead({
  title,
  lead,
  trailing,
}: {
  title: string;
  lead: string;
  trailing?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="text-[26px] text-[var(--ink)]">{title}</h1>
        <p className="mt-2 text-[13px] text-[var(--sub)]">{lead}</p>
      </div>
      {trailing}
    </div>
  );
}
