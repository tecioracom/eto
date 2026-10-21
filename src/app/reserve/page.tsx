import type { Metadata } from 'next';
import { Suspense } from 'react';
import { SITE_SHELL } from '@/components/site/styles';
import { EtoShell } from '../_ui';
import { ReserveFlow } from './ReserveFlow';
import { ReserveFromQuery } from './ReserveFromQuery';

/* ============================================================================
 * 予約 `/reserve`。予約の流れの2〜4段め。
 *
 * 書き出しの「メニューと日時」「お客様情報」「確認」「完了」の4画面を、
 * **1ルートの3つの状態**にしてある。予約は成立しないので、完了の画面を
 * 別ルートで持つと、直リンクで「ご予約を承りました」だけが開けてしまう。
 * 終点は同じルートの「ご予約内容の確認」。
 * ==========================================================================*/

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'ご予約 — éto',
    description:
      'éto のご予約。メニューと付け替えオフを選ぶと、所要時間と合計金額が同時に変わります。ご予約内容の確認までで、送信も保存もされません。',
    alternates: { canonical: '/reserve' },
    robots: { index: false, follow: false },
  };
}

export default async function ReservePage() {

  return (
    <EtoShell>
      <main id="main">
        <div className={`${SITE_SHELL} pb-20 pt-12 md:pt-16`}>
          <Suspense fallback={<ReserveFlow />}>
            <ReserveFromQuery />
          </Suspense>
        </div>
      </main>
    </EtoShell>
  );
}
