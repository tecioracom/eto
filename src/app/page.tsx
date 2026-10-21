import type { Metadata } from 'next';
import { SITE_SHELL } from '@/components/site/styles';
import { yen } from '@/components/site/format';
import { EtoShell, ETO_BTN, ETO_BTN_LINE } from './_ui';
import { DESIGNS, menu } from './_data';
import { SitePhoto } from '@/components/site/SitePhoto';

/* ============================================================================
 * éto トップ `/`。
 * 書き出した 1440×2734 の1ページを、そのまま1ルートに実装したもの。
 *
 * ■ 色の選び方
 *   グレージュからライラックまで。この業界の書き出しでよく見る高彩度の
 *   ピンクや黒のラメは使っていない。**1席のサロンで、隣の人の話し声が
 *   聞こえない**という売りに、強い色が合わないため。
 *
 * ■ 写真を使っていない
 *   書き出しは手元と施術室の写真だが、配信している素材は「文字が焼き込まれた
 *   1枚の書き出し」しかなく、文字の入らない領域を切り出せない。写真を
 *   捏造せず、同じ明度と色の推移だけを CSS で置いた（samples.css の
 *   .eto-hand / .eto-nail-N / .eto-room）。書き出しのほうは
 *   Teciora 側の画面設計ページ に並べてある。
 *
 * ■ デザインの名前には必ずメニューと金額を添える
 *   「Sheer rose」だけでは、いくらで何分かかるか分からない。
 *   数字は `_data.ts` の MENUS から引いていて、ここには書いていない。
 * ==========================================================================*/

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'éto — いつもの手元に好きな色を。',
    description:
      'ひとりずつ施術するプライベートのネイルサロン éto。今月のデザインと、メニュー・料金、ご予約。Teciora が制作したサンプルサイトで、éto は架空のサロンです。',
    alternates: { canonical: '/' },
    robots: { index: false, follow: false },
  };
}

export default async function EtoTopPage() {

  return (
    <EtoShell>
      <main id="main">
        {/* §hero */}
        <section className="grid items-center gap-10 md:grid-cols-2 md:gap-0">
          <div className={`${SITE_SHELL} py-10 md:py-16`}>
            <p className="eto-label text-[11px] uppercase text-[var(--sub)]">
              Private nail studio
            </p>
            <h1 className="eto-display mt-6 text-[56px] leading-[1.06] text-[var(--ink)] md:text-[76px]">
              A little
              <br />
              color,
              <br />
              all yours.
            </h1>
            <p className="mt-6 text-[20px] leading-[1.6] text-[var(--ink)] md:text-[22px]">
              いつもの手元に
              <br />
              好きな色を。
            </p>
            <p className="mt-5 text-[13px] leading-[1.9] text-[var(--sub)]">
              好きな色や普段の服装を伺いながら
              <br />
              色と長さを一緒に決めていきます。
            </p>
            <a
              href="/reserve"
              className={`${ETO_BTN} mt-8`}
            >
              空いている日時を見る
              <span aria-hidden="true">&#8599;</span>
            </a>
          </div>

          {/* このページで先読みする唯一の1枚（折りたたみの上の手元）。 */}
          <SitePhoto
            src="eto/hand"
            width={800}
            height={1067}
            eager
            className="eto-hand min-h-[300px] w-full md:min-h-[640px]"
          />
        </section>

        {/* §今月のデザイン */}
        <section id="designs" className={`${SITE_SHELL} py-16 md:py-24`}>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eto-label text-[11px] uppercase text-[var(--sub)]">
                The edit / 01
              </p>
              <h2 className="mt-3 text-[28px] leading-[1.4] text-[var(--ink)] md:text-[32px]">
                今月のデザイン
              </h2>
              <p className="mt-2 text-[13px] text-[var(--sub)]">
                色の変更もご相談ください。
              </p>
            </div>
            <a
              href="/menu"
              className="inline-flex min-h-[44px] items-center gap-2 text-[13px] text-[var(--ink)] underline underline-offset-4"
            >
              メニューを見る
              <span aria-hidden="true">&#8599;</span>
            </a>
          </div>

          {/* 段違いに並べる。3点とも同じ高さに揃えない。 */}
          <ul role="list" className="mt-12 grid gap-8 sm:grid-cols-3">
            {DESIGNS.map((d, i) => {
              const m = menu(d.menuId);
              const shift =
                i === 1 ? 'sm:mt-16' : i === 2 ? 'sm:mt-6' : '';
              return (
                <li key={d.no} className={shift}>
                  <SitePhoto
                    src={d.photo}
                    width={1000}
                    height={750}
                    className={`${d.tone} aspect-[4/3] w-full rounded-[2px]`}
                  />
                  <p className="mt-4 text-[15px] text-[var(--ink)]">
                    {d.no} / <span className="eto-display">{d.name}</span>
                  </p>
                  <p className="eto-num mt-2 text-[13px] text-[var(--sub)]">
                    {m.name} {m.minutes}分 {yen(m.price)}
                  </p>
                </li>
              );
            })}
          </ul>
        </section>

        {/* §相談 */}
        <section className={`${SITE_SHELL} pb-6`}>
          <div className="grid gap-10 md:grid-cols-2 md:gap-14">
            <SitePhoto
              src="eto/room"
              width={1000}
              height={667}
              className="eto-room min-h-[280px] w-full rounded-[2px]"
            />
            <div>
              <p className="eto-label text-[11px] uppercase text-[var(--sub)]">
                Your time
              </p>
              <h2 className="mt-3 text-[28px] leading-[1.5] text-[var(--ink)] md:text-[32px]">
                色も長さも
                <br />
                ご相談ください。
              </h2>
              <p className="mt-5 text-[13px] leading-[1.9] text-[var(--sub)]">
                色やデザインが決まっていなくても大丈夫です。
                <br />
                サンプルを爪に合わせながら選べます。
                <br />
                料金は施術前にお伝えします。
              </p>
              <a
                href="/menu"
                className={`${ETO_BTN_LINE} mt-7`}
              >
                メニューと料金
              </a>
            </div>
          </div>
        </section>
      </main>
    </EtoShell>
  );
}
