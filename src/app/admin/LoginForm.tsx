'use client';

import { useId, useState } from 'react';
import { useRouter } from 'next/navigation';
import { TextField } from '@/components/site/fields';
import {
  email as vEmail,
  required,
  type FieldError,
} from '@/components/site/validate';
import { ETO_BTN } from '../_ui';

/* ============================================================================
 * 店舗スタッフのログイン。
 *
 * ■ ボタンは「ログイン」のまま、押すと本当に管理画面が開く
 *   照合する相手がいないので、入力チェックだけを行い、通れば予約カレンダーへ進む。
 *   押せないボタンを置いて「押せません」と書くより、**押した結果が
 *   ちゃんと出る**ほうが、何ができるかが伝わる。
 *
 * ■ 「本当のパスワードを入れないでください」と先に書く
 *   見本と分かっていても、ログインの形をした画面には打つ人がいる。
 *   照合しないこと・どこにも送らないことを、入力欄の**前**に置く。
 *   `autoComplete="off"` にして、パスワード管理ソフトに覚えさせない。
 *
 * ■ 「ログイン状態を保持する」は置いていない
 *   端末に何かを残す機能なので、cookie も localStorage も使わない見本では
 *   成立しない。書き出しには描かれているが、実装では外して理由を書いた。
 * ==========================================================================*/

export function LoginForm() {
  const uid = useId().replace(/:/g, '');
  const id = (k: string) => `${uid}-${k}`;
  const router = useRouter();

  const [mail, setMail] = useState('');
  const [pass, setPass] = useState('');
  const [checked, setChecked] = useState(false);

  const errors: Record<string, FieldError> = {
    mail: vEmail(mail),
    pass: required(pass, 'パスワード'),
  };
  const err = (k: string) => (checked ? (errors[k] ?? null) : null);

  function onLogin() {
    setChecked(true);
    if (errors.mail || errors.pass) return;
    router.push('/admin/calendar');
  }

  return (
    <div role="group" aria-label="店舗スタッフのログイン" className="w-full">
      <h1 className="text-[28px] text-[var(--ink)]">ログイン</h1>

      <p className="mt-4 rounded-[2px] border border-[var(--line-strong)] bg-[var(--soft)] px-4 py-3 text-[12px] font-semibold leading-[1.8] text-[var(--soft-ink)]">
        この画面は見本です。入力は照合されず、どこにも送られません。実際にお使いの
        パスワードは入力しないでください。
      </p>

      <div className="mt-5 space-y-5">
        <TextField
          id={id('mail')}
          label="メールアドレス"
          type="email"
          inputMode="email"
          value={mail}
          onChange={setMail}
          placeholder="staff@example.com"
          autoComplete="off"
          error={err('mail')}
        />
        <TextField
          id={id('pass')}
          label="パスワード"
          type="password"
          value={pass}
          onChange={setPass}
          autoComplete="off"
          error={err('pass')}
        />
      </div>

      {/*
        書き出しには「ログイン状態を保持する」のチェックがあるが、実装では
        置いていない。**端末に何かを残す機能**なので、cookie も
        localStorage も使わない見本では成立しない。押せるのに何も起きない
        部品を置くくらいなら、無いほうが誠実である。
      */}
      <p className="mt-4 text-[12px] leading-[1.8] text-[var(--sub)]">
        この見本は cookie もブラウザの保存領域も使わないので、
        「ログイン状態を保持する」は置いていません。
      </p>

      <button type="button" onClick={onLogin} className={`${ETO_BTN} mt-6 sm:w-full`}>
        ログイン
      </button>

      <p className="mt-4 text-[12px] leading-[1.8] text-[var(--sub)]">
        パスワードを忘れた方は管理者へご連絡ください。
      </p>
    </div>
  );
}
