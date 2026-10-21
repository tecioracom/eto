import type { Metadata } from 'next';
import { SITE_SHELL } from '@/components/site/styles';
import { yen } from '@/components/site/format';
import { EtoShell, PageHead, ETO_BTN } from '../_ui';
import { MENUS, MENU_NOTE, OFF_NOTE } from '../_data';
import { SitePhoto } from '@/components/site/SitePhoto';

/* ============================================================================
 * メニュー・料金 `/menu`。予約の流れの1段め。
 *   メニュー・料金 → メニューと日時 → お客様情報 → ご予約内容の確認
 *
 * ■ 時間と金額を必ず対にする
 *   「ワンカラー / 60分 …… ¥6,600」。金額だけの表にすると、その日の枠に
 *   入るかどうかが分からないまま予約に進むことになる。数字は `_data.ts` の
 *   MENUS が1か所で持っていて、予約画面も管理画面も同じものを見ている。
 * ==========================================================================*/

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'メニュー・料金 — éto',
    description:
      'éto のメニューと料金。ワンカラー60分¥6,600、マグネット75分¥7,700、フレンチ90分¥8,800、デザイン90分¥8,800、ハンドケア40分¥4,400。付け替えオフは当店¥0・他店¥1,100（＋30分）。',
    alternates: { canonical: '/menu' },
    robots: { index: false, follow: false },
  };
}

export default async function MenuPage() {

  return (
    <EtoShell>
      <main id="main">
        <div className={`${SITE_SHELL} pb-20 pt-12 md:pt-16`}>
          <PageHead overline="Menu &amp; price" title="メニュー・料金" lead={MENU_NOTE} />

          <div className="mt-10 grid gap-10 md:grid-cols-[minmax(0,360px)_minmax(0,1fr)] md:gap-14">
            <SitePhoto
              src="eto/nail-1"
              width={1000}
              height={750}
              eager
              className="eto-nail-1 min-h-[280px] w-full rounded-[2px] md:min-h-[440px]"
            />

            <div>
              <ul role="list" className="border-t border-[var(--line)]">
                {MENUS.map((m) => (
                  <li
                    key={m.id}
                    className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b border-[var(--line)] py-5"
                  >
                    <span className="text-[16px] text-[var(--ink)]">
                      {m.name} / <span className="eto-num">{m.minutes}分</span>
                      <span className="mt-1 block text-[12px] leading-[1.7] text-[var(--sub)]">
                        {m.note}
                      </span>
                    </span>
                    <span className="eto-num text-[17px] text-[var(--ink)]">
                      {yen(m.price)}
                    </span>
                  </li>
                ))}
              </ul>

              <p className="mt-5 text-[12px] leading-[1.9] text-[var(--sub)]">
                {OFF_NOTE}
                <br />
                長さ出し・補強をご希望の方は予約時にお知らせください。
              </p>

              <a href="/reserve" className={`${ETO_BTN} mt-7`}>
                空き時間を確認
              </a>
            </div>
          </div>
        </div>
      </main>
    </EtoShell>
  );
}
