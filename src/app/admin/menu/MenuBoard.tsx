'use client';

import { useId, useState } from 'react';
import { AdminCard } from '@/components/site/AdminShell';
import { SelectField } from '@/components/site/fields';
import { yen } from '@/components/site/format';
import {
  DESIGNS,
  MENUS,
  OFFS,
  SLOT_PRESETS,
  presetLabel,
  type MenuId,
} from '../../_data';
import { ETO_BTN, ETO_BTN_LINE } from '../../_ui';
import { SitePhoto } from '@/components/site/SitePhoto';

/* ============================================================================
 * メニュー・予約枠。**料金と施術時間を1つの欄で直す。**
 *
 * ■ なぜ1つの欄にするか
 *   料金だけ変えて施術時間を直し忘れると、その日の枠が合わなくなる
 *   （前の人が終わらないうちに次の人が来る）。分と円を対にした候補からしか
 *   選べない形にすれば、片方だけ動かすことができない。
 *
 * ■ 直した結果を、お客様側の合計で見せる
 *   ワンカラーの枠を変えると、下に出る「ワンカラー＋他店オフ」の合計が
 *   その場で変わる。予約画面に出ている数字と同じ関数から出しているので、
 *   ここで直した内容がどこに効くのかが分かる。
 *
 * ■ 保存はしない。終点は「変更内容の確認」。
 * ==========================================================================*/

type Setting = { minutes: number; price: number };
type Settings = Record<string, Setting>;

const SAVED: Settings = Object.fromEntries(
  MENUS.map((m) => [m.id, { minutes: m.minutes, price: m.price }]),
);

/** 候補の並びの中での位置。select の値にする。 */
function presetIndex(s: Setting): string {
  const i = SLOT_PRESETS.findIndex(
    (p) => p.minutes === s.minutes && p.price === s.price,
  );
  return String(i < 0 ? 0 : i);
}

export function MenuBoard() {
  const uid = useId().replace(/:/g, '');
  const id = (k: string) => `${uid}-${k}`;

  const [settings, setSettings] = useState<Settings>({ ...SAVED });
  const [reviewing, setReviewing] = useState(false);

  function pick(key: MenuId, index: string) {
    const p = SLOT_PRESETS[Number(index)] ?? SLOT_PRESETS[0];
    setSettings((s) => ({ ...s, [key]: { ...p } }));
  }

  const changes: string[] = [];
  for (const m of MENUS) {
    const before = presetLabel(SAVED[m.id].minutes, SAVED[m.id].price);
    const after = presetLabel(settings[m.id].minutes, settings[m.id].price);
    if (before !== after) changes.push(`${m.name}：${before} → ${after}`);
  }

  /* 予約画面に出るのと同じ足し算。ここで直した内容がどこに効くかを見せる。 */
  const other = OFFS.find((o) => o.id === 'other');
  const one = settings.onecolor;
  const sampleMinutes = one.minutes + (other?.minutes ?? 0);
  const samplePrice = one.price + (other?.price ?? 0);

  /* --------------------------------------------------------- 変更内容の確認 */
  if (reviewing) {
    return (
      <AdminCard>
        <h2
          id={id('review-head')}
          tabIndex={-1}
          className="text-[24px] text-[var(--ink)]"
        >
          変更内容の確認
        </h2>

        {changes.length === 0 ? (
          <p className="mt-4 text-[14px] leading-[1.9] text-[var(--sub)]">
            変更されている項目はありません。
            {MENUS.map((m) => `${m.name} ${presetLabel(SAVED[m.id].minutes, SAVED[m.id].price)}`).join(' / ')}{' '}
            のままです。
          </p>
        ) : (
          <ul className="mt-4 space-y-2">
            {changes.map((c) => (
              <li
                key={c}
                className="border-l-2 border-[var(--accent)] pl-4 text-[14px] leading-[1.9] text-[var(--ink)]"
              >
                {c}
              </li>
            ))}
          </ul>
        )}

        <p className="mt-6 border-t border-[var(--line)] pt-5 text-[13px] leading-[1.9] text-[var(--sub)]">
          ここまでが確認です。変更は保存されていません。この画面は見本なので、
          入力はどこにも送られず、ブラウザを閉じれば残りません。
        </p>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => setReviewing(false)}
            className={ETO_BTN_LINE}
          >
            編集に戻る
          </button>
          <a
            href="/admin/calendar"
            className={ETO_BTN_LINE}
          >
            予約カレンダーに戻る
          </a>
        </div>
      </AdminCard>
    );
  }

  /* ------------------------------------------------------------------ 編集 */
  return (
    <div>
      <ul role="list" className="space-y-4">
        {MENUS.map((m, i) => {
          const s = settings[m.id];
          const design = DESIGNS[i % DESIGNS.length];
          return (
            <li key={m.id}>
              <AdminCard>
                <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
                  <SitePhoto
                    src={design.photo}
                    width={700}
                    height={525}
                    eager={i === 0}
                    className={`${design.tone} h-[96px] w-full shrink-0 rounded-[2px] sm:w-[120px]`}
                  />
                  <div className="min-w-0 flex-1">
                    <h3 className="text-[19px] text-[var(--ink)]">{m.name}</h3>
                    <p className="mt-1 text-[12px] leading-[1.7] text-[var(--sub)]">
                      {m.note}
                    </p>
                    <div className="mt-3 max-w-[320px]">
                      <SelectField
                        id={id(m.id)}
                        label="現在の設定"
                        value={presetIndex(s)}
                        onChange={(v) => pick(m.id, v)}
                        options={SLOT_PRESETS.map((p, k) => ({
                          value: String(k),
                          label: presetLabel(p.minutes, p.price),
                        }))}
                        hint="施術時間と料金は対で選びます。片方だけは変えられません。"
                      />
                    </div>
                  </div>
                </div>
              </AdminCard>
            </li>
          );
        })}
      </ul>

      <AdminCard className="mt-4" title="この設定でのお客様側の表示">
        <p aria-live="polite" className="eto-num text-[15px] text-[var(--ink)]">
          ワンカラー＋他店オフ ＝ {sampleMinutes}分・{yen(samplePrice)}
        </p>
        <p className="mt-2 text-[12px] leading-[1.8] text-[var(--sub)]">
          他店オフ（＋30分・{yen(other?.price ?? 0)}）を足した合計です。予約画面の
          「選択中の内容」と同じ計算をしています。
        </p>
      </AdminCard>

      <button
        type="button"
        onClick={() => {
          setReviewing(true);
          window.requestAnimationFrame(() => {
            document.getElementById(id('review-head'))?.focus();
          });
        }}
        className={`${ETO_BTN} mt-6`}
      >
        設定を保存
      </button>
      <p className="mt-3 text-[12px] leading-[1.8] text-[var(--sub)]">
        押すと変更内容の確認に進みます。この画面では保存されません。
      </p>
    </div>
  );
}
