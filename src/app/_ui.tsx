import type { ReactNode } from 'react';
import { SiteFooter } from '@/components/site/SiteFooter';
import { SITE_SHELL } from '@/components/site/styles';
import { CLOSED_DAY, OPEN_HOURS } from './_data';

/* ============================================================================
 * éto の共通パーツ（ワードマーク・ヘッダー・サロンのフッター・ページの器）。
 *
 * ■ 器の入れ子
 *     <EtoShell>                        ← .sample-body.sample-eto（配色スコープ）
 *       <EtoHeader /> … <main> …        ← サロンの画面
 *       <EtoFooter />                   ← サロンのフッター（ライラック）
 *     </EtoShell>
 *     <SiteFooter />                    ← Teciora の帯（スコープの**外**）
 *
 *   Teciora の帯をスコープの中に入れると、グレージュとライラックのパレットを
 *   継承して「サロンのフッターが2つある」ように見える。必ず外に出すこと。
 *
 * ■ 主ボタンは共有の BTN_PRIMARY を使わない
 *   BTN_PRIMARY は `--green`（＝この店では管理画面の柱の濃い李）の塗り。
 *   表側の押せるボタンは中間の紫なので、差し色の変数を持つ ETO_BTN を
 *   この器に置いている。共有側に固定色を足さないための分け方。
 *
 * ■ ここにも overflow / transform / filter を付けない（sticky が死ぬ）。
 * ==========================================================================*/

/** 紫の塗り。押すと次に進むもの。 */
export const ETO_BTN =
  'inline-flex min-h-[48px] w-full items-center justify-center gap-3 rounded-[2px] bg-[var(--accent)] px-6 text-[14px] text-[var(--paper)] transition duration-150 hover:bg-[var(--accent-deep)] sm:w-auto sm:min-w-[220px]';

/** 線だけのボタン（戻る・やり直す）。 */
export const ETO_BTN_LINE =
  'inline-flex min-h-[48px] w-full items-center justify-center gap-3 rounded-[2px] border border-[var(--line-strong)] bg-[var(--paper)] px-6 text-[14px] text-[var(--ink)] transition duration-150 hover:border-[var(--ink)] sm:w-auto sm:min-w-[200px]';

export function Wordmark({
  size = 'md',
  tone = 'ink',
}: {
  size?: 'sm' | 'md' | 'lg';
  tone?: 'ink' | 'cream';
}) {
  const px =
    size === 'lg' ? 'text-[44px]' : size === 'sm' ? 'text-[24px]' : 'text-[30px]';
  const color = tone === 'cream' ? 'text-[var(--cream)]' : 'text-[var(--ink)]';
  return (
    <span className={`eto-wordmark block ${px} ${color}`} aria-hidden="true">
      éto
    </span>
  );
}

export function WordmarkLink({
  tone = 'ink',
  size = 'md',
}: {
  tone?: 'ink' | 'cream';
  size?: 'sm' | 'md' | 'lg';
}) {
  return (
    <a
      href="/"
      className="inline-flex min-h-[44px] items-center"
    >
      <Wordmark size={size} tone={tone} />
      <span className="sr-only">éto ホーム</span>
    </a>
  );
}

/** サロンのヘッダー。全ページ共通。 */
export function EtoHeader() {
  const nav: readonly { label: string; href: string }[] = [
    { label: 'デザイン', href: `/#designs` },
    { label: 'メニュー・料金', href: `/menu` },
    { label: '予約する', href: `/reserve` },
  ];
  return (
    <header className="sticky top-0 z-20 bg-[var(--cream)]">
      <div
        className={`${SITE_SHELL} flex min-h-[var(--site-header-h)] flex-wrap items-center justify-between gap-x-8 gap-y-2 py-3`}
      >
        <WordmarkLink size="sm" />
        <nav aria-label="éto のメニュー">
          <ul className="flex flex-wrap items-center gap-x-6 gap-y-1">
            {nav.map((n) => (
              <li key={n.href}>
                <a
                  href={n.href}
                  className="inline-flex min-h-[44px] items-center text-[13px] text-[var(--ink)] hover:underline hover:underline-offset-4"
                >
                  {n.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}

/** サロンのフッター（ライラック）。8本の中でここだけは éto の言葉で書く。 */
export function EtoFooter() {
  return (
    <div className="mt-20 bg-[var(--soft)] py-12 md:py-14">
      <div className={SITE_SHELL}>
        <Wordmark size="lg" />
        <p className="eto-label mt-3 text-[11px] uppercase text-[var(--sub)]">
          Nail Studio
        </p>
        <p className="mt-5 text-[14px] leading-[1.9] text-[var(--soft-ink)]">
          {OPEN_HOURS}　{CLOSED_DAY}
          <br />
          ご予約は24時間受け付けています。
        </p>

        <nav aria-label="éto のページ" className="mt-7 text-[13px]">
          <ul className="flex flex-wrap gap-x-8 gap-y-2">
            <li>
              <a
                href="/menu"
                className="inline-flex min-h-[44px] items-center text-[var(--soft-ink)] hover:underline"
              >
                メニュー・料金
              </a>
            </li>
            <li>
              <a
                href="/reserve"
                className="inline-flex min-h-[44px] items-center text-[var(--soft-ink)] hover:underline"
              >
                予約する
              </a>
            </li>
            <li>
              <a
                href="/admin"
                className="inline-flex min-h-[44px] items-center text-[var(--soft-ink)] hover:underline"
              >
                サロンの方
              </a>
            </li>
          </ul>
        </nav>

        <p className="mt-10 text-[12px] text-[var(--sub)]">
          &copy; 2026 éto &nbsp;/&nbsp; 架空のサロンです。
        </p>
      </div>
    </div>
  );
}

/**
 * 1ページぶんの器。
 * `main` の id は本体サイトと同じ `main`（スキップリンクの行き先）。
 */
export function EtoShell({
  children,
  hideHeader = false,
  hideFooter = false,
}: {
  children: ReactNode;
  hideHeader?: boolean;
  hideFooter?: boolean;
}) {
  return (
    <>
      <div className="sample-body sample-eto min-h-screen bg-[var(--cream)] text-[var(--ink)]">
        {!hideHeader && <EtoHeader />}
        {children}
        {!hideFooter && <EtoFooter />}
      </div>
      <SiteFooter />
    </>
  );
}

/** 下層ページの見出しの塊。 */
export function PageHead({
  overline,
  title,
  lead,
}: {
  overline: string;
  title: string;
  lead?: string;
}) {
  return (
    <div>
      <p className="eto-label text-[11px] uppercase text-[var(--sub)]">
        {overline}
      </p>
      <h1 className="mt-3 text-[32px] leading-[1.35] text-[var(--ink)] md:text-[38px]">
        {title}
      </h1>
      {lead && (
        <p className="mt-3 max-w-[34em] text-[14px] leading-[1.9] text-[var(--sub)]">
          {lead}
        </p>
      )}
    </div>
  );
}
