'use client';

import { useSearchParams } from 'next/navigation';
import { isMenuId, isOffId } from '../_data';
import { ReserveFlow } from './ReserveFlow';

/* ============================================================================
 * `?menu=onecolor&off=other` を読んで、選択済みの状態で開く。
 *
 * ■ `useSearchParams` は **必ず Suspense の内側**で呼ぶ
 *   包まないと、このルートは静的生成をやめてリクエストごとの描画になる。
 *   代替表示（fallback）には**同じ画面の既定状態**を渡す。「読み込み中」の
 *   箱にすると、JS が動かない環境でメニューが1つも出ない。
 *
 * ■ クエリに載せてよいのはメニューとオフの id だけ
 *   氏名・フリガナ・メール・電話は1文字も URL に載せない。
 *   未知の値は黙って既定（ワンカラー / オフなし）に落とす。
 * ==========================================================================*/

export function ReserveFromQuery() {
  const params = useSearchParams();
  const m = params.get('menu');
  const o = params.get('off');
  return (
    <ReserveFlow
      initialMenu={isMenuId(m) ? m : 'onecolor'}
      initialOff={isOffId(o) ? o : 'none'}
    />
  );
}
