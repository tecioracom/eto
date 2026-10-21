import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import { Inter, Noto_Sans_JP } from 'next/font/google';
import { Playfair_Display } from 'next/font/google';
import './globals.css';
import './site.css';

/* ============================================================================
 * éto 書体の読み込みと、配色スコープの土台。
 *
 * ■ 書体は **この layout でだけ** 読む
 *   8本を1つの動的ルートにまとめると、8本ぶんの書体が全ページで preload
 *   される。サイトごとに静的ルートを切っているのはそのため。
 *
 * ■ 和文フォントを next/font で読まない
 *   Google Fonts の css2 は和文を 100 以上の unicode-range に割って返し、
 *   next/font は既定でその全部を preload タグに並べる（実測 2MB 超）。
 *   和文は端末のゴシック（ルートの --font-noto-sans-jp → Hiragino …）に
 *   任せ、ここでは **欧文の大見出しに使う1書体だけ** を読む。
 *
 * ■ なぜ Playfair Display か
 *   書き出しの "A little color, all yours." と "éto" は、縦線と横線の差が
 *   大きいディドー系。latin サブセットに `é`（U+00E9）が含まれているので、
 *   ワードマークがフォールバックに落ちない。
 *
 * ■ この div は sticky 要素の祖先になる
 *   overflow / transform / filter / backdrop-filter / contain / will-change を
 *   絶対に付けないこと（ヘッダーと予約の集計パネルが sticky）。
 * ==========================================================================*/

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const notoSansJp = Noto_Sans_JP({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-noto-sans-jp',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '500'],
  display: 'swap',
  variable: '--font-eto-serif',
  adjustFontFallback: false,
  fallback: ['Didot', 'Times New Roman', 'serif'],
});

/*
 * 配信する以上は必ず noindex。理由は next.config.ts の headers() に書いた。
 * ページ側の metadata は title / description / canonical しか上書きしないので、
 * ここで決めた robots はそのまま効く。
 */
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ja" className={`${inter.variable} ${notoSansJp.variable}`}>
      <body>
        <div className="sample-shell"><div className={playfair.variable}>{children}</div></div>
      </body>
    </html>
  );
}
