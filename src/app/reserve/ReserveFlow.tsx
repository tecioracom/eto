'use client';

import { useId, useRef, useState, type ReactNode } from 'react';
import {
  CheckField,
  ErrorSummary,
  SelectField,
  TextAreaField,
  TextField,
} from '@/components/site/fields';
import { StepBar } from '@/components/site/StepBar';
import { yen } from '@/components/site/format';
import { formatLongJa } from '@/components/site/calendar';
import {
  agreed,
  email as vEmail,
  listErrors,
  phone as vPhone,
  required,
  trim,
  type FieldError,
} from '@/components/site/validate';
import {
  CHANGE_POLICY,
  FEATURED_ID,
  MENUS,
  OFFS,
  OFF_NOTE,
  PAYMENT_NOTE,
  STAFF,
  TODAY,
  VISIT_KIND,
  endTime,
  menu,
  off,
  openTimes,
  selection,
  staffName,
  timeRange,
  visitDateLabel,
  type MenuId,
  type OffId,
  type StaffId,
} from '../_data';
import { ETO_BTN, ETO_BTN_LINE } from '../_ui';

/* ============================================================================
 * 予約の3段。**この画面の終点は「ご予約内容の確認」**。
 *
 *   01 メニュー・日時 → 02 お客様情報 → 03 ご予約内容の確認
 *
 * 書き出しは「04 完了」まであるが、予約は成立しないので作らない。
 * 別ルートにすると、直リンクで「ご予約を承りました」だけが開けてしまう。
 *
 * ■ 時間と金額が同時に積み上がる
 *   ワンカラー（60分 ¥6,600）に他店オフ（30分 ¥1,100）を足すと、右の
 *   「選択中の内容」が **90分・¥7,700** に変わり、時刻を選んだ瞬間に
 *   「14:00–15:30」と終わりまで出る。**何分かかっていくら払うのかが、
 *   押す前に分かる。**計算は `_data.ts` の selection() が分と円を同時に返す。
 *
 * ■ 空き時間は台帳から出す
 *   いま作ろうとしている1件（ET-1003-014）を**入っていないものとして**
 *   数えた空きを出す（`openTimes(staff, FEATURED_ID)`）。管理画面の
 *   カレンダーは同じ台帳を `ignoreId` なしで読むので、予約が入ったあとの
 *   姿になる。1つの台帳から、前と後の2つの画面が出る。
 *
 * ■ `<form>` を使わない
 *   `<form>` はハイドレート前に Enter を押されると、現在の URL へ GET する。
 *   氏名・フリガナ・メール・電話が**そのままクエリ文字列に載る**。
 *   `div role="group"` + `type="button"` だけで組む。
 *
 * ■ 決済を置かない
 *   お支払いは当日、店頭で。カード番号の入力欄は1つも置かない。
 * ==========================================================================*/

const STEPS = ['メニュー・日時', 'お客様情報', 'ご予約内容の確認'];

const STEP1_ORDER = ['time'] as const;
const STEP1_LABELS: Record<string, string> = { time: 'ご希望の時間' };

const STEP2_ORDER = ['name', 'kana', 'email', 'tel', 'agree'] as const;
const STEP2_LABELS: Record<string, string> = {
  name: 'お名前',
  kana: 'フリガナ',
  email: 'メールアドレス',
  tel: '電話番号',
  agree: '変更・キャンセルの条件',
};

export function ReserveFlow({
  initialMenu = 'onecolor',
  initialOff = 'none',
}: {
  initialMenu?: MenuId;
  initialOff?: OffId;
}) {
  const uid = useId().replace(/:/g, '');
  const id = (k: string) => `${uid}-${k}`;
  const summaryRef = useRef<HTMLDivElement>(null);

  const [step, setStep] = useState(1);
  const [menuId, setMenuId] = useState<MenuId>(initialMenu);
  const [offId, setOffId] = useState<OffId>(initialOff);
  const [staff, setStaff] = useState<StaffId | ''>('');
  const [time, setTime] = useState('');

  const [name, setName] = useState('');
  const [kana, setKana] = useState('');
  const [email, setEmail] = useState('');
  const [tel, setTel] = useState('');
  const [visit, setVisit] = useState(VISIT_KIND[0].id);
  const [request, setRequest] = useState('');
  const [agree, setAgree] = useState(false);

  const [checked1, setChecked1] = useState(false);
  const [checked2, setChecked2] = useState(false);

  const sel = selection(menuId, offId);
  const available = openTimes(staff === '' ? null : staff, FEATURED_ID);
  /* 担当を変えると空きが変わる。選んでいた時刻が消えたら、選んでいない扱いにする。 */
  const picked = available.includes(time) ? time : '';

  const errors1: Record<string, FieldError> = {
    time: picked === '' ? 'ご希望の時間をお選びください。' : null,
  };
  const errors2: Record<string, FieldError> = {
    name: required(name, 'お名前'),
    kana: required(kana, 'フリガナ'),
    email: vEmail(email),
    tel: vPhone(tel),
    agree: agreed(agree, '変更・キャンセルの条件'),
  };

  const items1 = checked1 ? listErrors(STEP1_ORDER, errors1, STEP1_LABELS) : [];
  const items2 = checked2 ? listErrors(STEP2_ORDER, errors2, STEP2_LABELS) : [];
  const err1 = (k: string) => (checked1 ? (errors1[k] ?? null) : null);
  const err2 = (k: string) => (checked2 ? (errors2[k] ?? null) : null);

  function goStep2() {
    setChecked1(true);
    if (STEP1_ORDER.some((k) => errors1[k])) {
      window.requestAnimationFrame(() => summaryRef.current?.focus());
      return;
    }
    setStep(2);
    window.requestAnimationFrame(() => {
      document.getElementById(id('head'))?.focus();
    });
  }

  function goStep3() {
    setChecked2(true);
    if (STEP2_ORDER.some((k) => errors2[k])) {
      window.requestAnimationFrame(() => summaryRef.current?.focus());
      return;
    }
    setStep(3);
    window.requestAnimationFrame(() => {
      document.getElementById(id('head'))?.focus();
    });
  }

  /* 右のパネル。3段とも同じものを出す（見ている数字が途中で変わらない）。 */
  const panel = (
    <aside className="lg:sticky lg:top-[88px] lg:self-start">
      <div className="bg-[var(--soft)] px-5 py-5">
        <h2 className="text-[16px] text-[var(--soft-ink)]">
          {step === 1 ? '選択中の内容' : 'ご予約内容'}
        </h2>
        <dl className="mt-4 space-y-3 text-[13px]">
          <PanelRow label="ご予約">
            {picked === ''
              ? '時間を選ぶと出ます'
              : `${visitDateLabel()} ${picked}`}
          </PanelRow>
          <PanelRow label="施術終了の目安">
            {picked === '' ? '—' : endTime(picked, sel.minutes)}
          </PanelRow>
          <PanelRow label="施術">
            {menu(menuId).name} / {menu(menuId).minutes}分
          </PanelRow>
          <PanelRow label="オフ">
            {offId === 'none'
              ? 'なし'
              : `${off(offId).label} / ${off(offId).minutes}分`}
          </PanelRow>
          <PanelRow label="担当者">
            {staff === '' ? '指名なし' : staffName(staff)}
          </PanelRow>
          <PanelRow label="所要時間">
            <span className="eto-num">{sel.minutes}分</span>
          </PanelRow>
          <div className="flex items-baseline justify-between gap-4 border-t border-[var(--line-strong)] pt-3">
            <dt className="font-semibold text-[var(--soft-ink)]">合計（税込）</dt>
            <dd className="eto-num text-[18px] font-semibold text-[var(--soft-ink)]">
              {yen(sel.price)}
            </dd>
          </div>
          <PanelRow label="お支払い">{PAYMENT_NOTE}</PanelRow>
        </dl>
      </div>
      <p className="mt-3 text-[12px] leading-[1.8] text-[var(--sub)]">
        {formatLongJa(TODAY)}の空き状況で組んでいます。
      </p>
    </aside>
  );

  return (
    <div>
      <StepBar steps={STEPS} current={step} className="mb-10" />

      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-14">
        <div>
          {/* ------------------------------------------------ 01 メニュー・日時 */}
          {step === 1 && (
            <div role="group" aria-label="メニューと日時の選択">
              <h2
                id={id('head')}
                tabIndex={-1}
                className="text-[28px] leading-[1.4] text-[var(--ink)] md:text-[32px]"
              >
                メニューと日時を選ぶ
              </h2>
              <p className="mt-2 text-[13px] text-[var(--sub)]">
                ジェルが付いている方は付け替えオフもお選びください。
              </p>

              {items1.length > 0 && (
                <div ref={summaryRef} className="mt-6">
                  <ErrorSummary
                    id={id('summary1')}
                    title={`選択を確認してください（${items1.length}件）`}
                    items={items1}
                    fieldId={(k) => id(k)}
                  />
                </div>
              )}

              {/* メニュー */}
              <div
                role="radiogroup"
                aria-labelledby={id('menu-label')}
                className="mt-7"
              >
                <p
                  id={id('menu-label')}
                  className="text-[13px] font-semibold text-[var(--ink)]"
                >
                  メニュー
                </p>
                <div className="mt-2 space-y-2">
                  {MENUS.map((m) => (
                    <label
                      key={m.id}
                      className="flex min-h-[44px] items-start gap-3 rounded-[2px] border border-[var(--line-strong)] bg-[var(--paper)] px-4 py-3"
                    >
                      <input
                        type="radio"
                        checked={menuId === m.id}
                        onChange={() => setMenuId(m.id)}
                        className="mt-[4px] h-[16px] w-[16px] shrink-0 border-[var(--line-strong)] text-[var(--accent)] focus:ring-0"
                      />
                      <span className="min-w-0">
                        <span className="text-[15px] text-[var(--ink)]">
                          {m.name}
                          <span className="eto-num">
                            {yen(m.price)} / {m.minutes}分
                          </span>
                        </span>
                        <span className="mt-1 block text-[12px] leading-[1.7] text-[var(--sub)]">
                          {m.note}
                        </span>
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* 付け替えオフ */}
              <div
                role="group"
                aria-labelledby={id('off-label')}
                className="mt-8"
              >
                <p
                  id={id('off-label')}
                  className="text-[13px] font-semibold text-[var(--ink)]"
                >
                  付け替えオフ
                </p>
                <div className="mt-2 flex flex-wrap gap-3">
                  {OFFS.map((o) => {
                    const on = o.id === offId;
                    return (
                      <button
                        key={o.id}
                        type="button"
                        aria-pressed={on}
                        onClick={() => setOffId(o.id)}
                        className={
                          on
                            ? 'inline-flex min-h-[48px] min-w-[150px] items-center justify-center rounded-[2px] bg-[var(--accent)] px-5 text-[13px] text-[var(--paper)]'
                            : 'inline-flex min-h-[48px] min-w-[150px] items-center justify-center rounded-[2px] border border-[var(--line-strong)] bg-[var(--paper)] px-5 text-[13px] text-[var(--ink)] hover:border-[var(--ink)]'
                        }
                      >
                        {o.label} / ＋{o.minutes}分
                      </button>
                    );
                  })}
                </div>
                <p aria-live="polite" className="eto-num mt-3 text-[12px] text-[var(--sub)]">
                  {offId === 'other'
                    ? `他店オフ ${yen(off('other').price)}を含む / `
                    : ''}
                  合計{sel.minutes}分・{yen(sel.price)}
                </p>
                <p className="mt-1 text-[12px] text-[var(--sub)]">{OFF_NOTE}</p>
              </div>

              {/* 担当者とご来店日 */}
              <div className="mt-8 grid gap-5 sm:grid-cols-2">
                <SelectField
                  id={id('staff')}
                  label="担当者"
                  value={staff}
                  onChange={(v) => setStaff(v as StaffId | '')}
                  options={[
                    { value: '', label: '指名なし' },
                    ...STAFF.map((s) => ({ value: s.id, label: s.name })),
                  ]}
                  hint="指名なしにすると、空いている担当者がお受けします。"
                />
                <SelectField
                  id={id('date')}
                  label="ご来店日"
                  value={TODAY}
                  onChange={() => undefined}
                  options={[{ value: TODAY, label: formatLongJa(TODAY) }]}
                  hint="この見本はこの1日の空き状況だけを持っています。"
                />
              </div>

              {/* 空いている時間 */}
              <div
                role="group"
                aria-labelledby={id('time-label')}
                className="mt-8"
                id={id('time')}
                tabIndex={-1}
              >
                <p
                  id={id('time-label')}
                  className="text-[13px] font-semibold text-[var(--ink)]"
                >
                  空いている時間
                </p>
                {available.length === 0 ? (
                  <p className="mt-2 rounded-[2px] border border-[var(--line-strong)] bg-[var(--paper)] px-4 py-4 text-[13px] leading-[1.8] text-[var(--ink)]">
                    {staff === '' ? '' : `${staffName(staff as StaffId)}は`}
                    この日は空きがありません。担当者を「指名なし」に戻すと、
                    ほかの担当者の空きが出ます。
                  </p>
                ) : (
                  <div className="mt-2 flex flex-wrap gap-3">
                    {available.map((t) => {
                      const on = t === picked;
                      return (
                        <button
                          key={t}
                          type="button"
                          aria-pressed={on}
                          onClick={() => setTime(t)}
                          className={
                            on
                              ? 'eto-num inline-flex min-h-[48px] min-w-[120px] items-center justify-center rounded-[2px] bg-[var(--accent)] px-5 text-[14px] text-[var(--paper)]'
                              : 'eto-num inline-flex min-h-[48px] min-w-[120px] items-center justify-center rounded-[2px] border border-[var(--line-strong)] bg-[var(--paper)] px-5 text-[14px] text-[var(--ink)] hover:border-[var(--ink)]'
                          }
                        >
                          {t}
                        </button>
                      );
                    })}
                  </div>
                )}
                {err1('time') && (
                  <p className="mt-2 text-[13px] font-semibold text-[var(--alert)]">
                    {err1('time')}
                  </p>
                )}
                {picked !== '' && (
                  <p aria-live="polite" className="eto-num mt-3 text-[13px] text-[var(--ink)]">
                    {visitDateLabel()} {timeRange(picked, sel.minutes)}（
                    {sel.minutes}分）
                  </p>
                )}
              </div>

              <button type="button" onClick={goStep2} className={`${ETO_BTN} mt-8`}>
                お客様情報へ
              </button>
            </div>
          )}

          {/* ------------------------------------------------ 02 お客様情報 */}
          {step === 2 && (
            <div role="group" aria-label="お客様情報の入力">
              <h2
                id={id('head')}
                tabIndex={-1}
                className="text-[28px] leading-[1.4] text-[var(--ink)] md:text-[32px]"
              >
                お客様情報
              </h2>
              <p className="mt-2 text-[13px] text-[var(--sub)]">
                ご予約の確認メールをお送りします。
              </p>

              {items2.length > 0 && (
                <div ref={summaryRef} className="mt-6">
                  <ErrorSummary
                    id={id('summary2')}
                    title={`入力を確認してください（${items2.length}件）`}
                    items={items2}
                    fieldId={(k) => id(k)}
                  />
                </div>
              )}

              <div className="mt-7 space-y-5">
                <TextField
                  id={id('name')}
                  label="お名前"
                  value={name}
                  onChange={setName}
                  placeholder="例：山田 花子"
                  autoComplete="name"
                  requiredMark
                  error={err2('name')}
                />
                <TextField
                  id={id('kana')}
                  label="フリガナ"
                  value={kana}
                  onChange={setKana}
                  placeholder="例：ヤマダ ハナコ"
                  requiredMark
                  error={err2('kana')}
                />
                <TextField
                  id={id('email')}
                  label="メールアドレス"
                  type="email"
                  inputMode="email"
                  value={email}
                  onChange={setEmail}
                  placeholder="例：hanako@example.com"
                  autoComplete="email"
                  requiredMark
                  error={err2('email')}
                />
                <TextField
                  id={id('tel')}
                  label="電話番号"
                  type="tel"
                  inputMode="tel"
                  value={tel}
                  onChange={setTel}
                  placeholder="例：050-0123-4567"
                  autoComplete="tel"
                  requiredMark
                  error={err2('tel')}
                />
                <SelectField
                  id={id('visit')}
                  label="ご来店について"
                  value={visit}
                  onChange={setVisit}
                  options={VISIT_KIND.map((v) => ({ value: v.id, label: v.label }))}
                />
                <TextAreaField
                  id={id('request')}
                  label="ご要望（任意）"
                  value={request}
                  onChange={setRequest}
                  rows={3}
                  placeholder="例：短めの長さを希望します"
                  hint="爪の状態やアレルギーなど施術前に伝えたいことがあればご記入ください。"
                />
              </div>

              <div className="mt-8 border-t border-[var(--line)] pt-6">
                <ul className="space-y-1 text-[12px] leading-[1.8] text-[var(--sub)]">
                  {CHANGE_POLICY.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
                <CheckField
                  id={id('agree')}
                  className="mt-4"
                  checked={agree}
                  onChange={setAgree}
                  error={err2('agree')}
                  label="変更・キャンセルは前日18:00までと確認しました。"
                />
              </div>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <button type="button" onClick={goStep3} className={ETO_BTN}>
                  予約内容を確認
                </button>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className={ETO_BTN_LINE}
                >
                  メニュー・日時に戻る
                </button>
              </div>
            </div>
          )}

          {/* ------------------------------------------ 03 ご予約内容の確認 */}
          {step === 3 && (
            <div>
              <h2
                id={id('head')}
                tabIndex={-1}
                className="text-[28px] leading-[1.4] text-[var(--ink)] md:text-[32px]"
              >
                ご予約内容の確認
              </h2>
              <p className="mt-2 text-[13px] text-[var(--sub)]">
                まだ予約は確定していません。
              </p>

              <div className="mt-6 rounded-[2px] border border-[var(--accent)] bg-[var(--soft)] px-5 py-4">
                <p className="text-[14px] font-semibold leading-[1.8] text-[var(--accent)]">
                  ここまでが確認です。ご予約はまだ確定していません。
                </p>
                <p className="mt-2 text-[13px] leading-[1.9] text-[var(--soft-ink)]">
                  入力した内容は送信も保存もされません。ブラウザを閉じれば残りません。
                  予約番号は、予約が確定したときに発行されます。
                </p>
              </div>

              <dl className="mt-8 divide-y divide-[var(--line)] border-y border-[var(--line)]">
                <Row label="日時">
                  {visitDateLabel()} {timeRange(picked, sel.minutes)}
                </Row>
                <Row label="メニュー">
                  {menu(menuId).name} {yen(menu(menuId).price)} / {menu(menuId).minutes}分
                </Row>
                <Row label="オフ">
                  {offId === 'none'
                    ? 'なし'
                    : `${off(offId).label}オフ ${yen(off(offId).price)} / ＋${off(offId).minutes}分`}
                </Row>
                <Row label="担当者">
                  {staff === '' ? '指名なし' : staffName(staff)}
                </Row>
                <Row label="お名前">{trim(name)} 様</Row>
                <Row label="フリガナ">{trim(kana)}</Row>
                <Row label="メール">{trim(email)}</Row>
                <Row label="電話番号">{trim(tel)}</Row>
                <Row label="ご来店について">
                  {VISIT_KIND.find((v) => v.id === visit)?.label}
                </Row>
                <Row label="ご要望">
                  {trim(request) === '' ? 'なし' : trim(request)}
                </Row>
                <Row label="合計（税込）">
                  <span className="eto-num text-[20px]">{yen(sel.price)}</span>
                  <br />
                  <span className="text-[12px] text-[var(--sub)]">
                    所要時間 {sel.minutes}分 / お支払いは{PAYMENT_NOTE}
                  </span>
                </Row>
              </dl>

              <ul className="mt-6 space-y-1 text-[12px] leading-[1.9] text-[var(--sub)]">
                {CHANGE_POLICY.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className={ETO_BTN_LINE}
                >
                  入力内容を修正する
                </button>
                <a href="/" className={ETO_BTN_LINE}>
                  トップへ戻る
                </a>
              </div>
            </div>
          )}
        </div>

        {panel}
      </div>
    </div>
  );
}

function PanelRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt className="text-[var(--soft-ink)]">{label}</dt>
      <dd className="text-right text-[var(--soft-ink)]">{children}</dd>
    </div>
  );
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid gap-1 py-4 sm:grid-cols-[150px_minmax(0,1fr)] sm:gap-6">
      <dt className="text-[13px] font-semibold text-[var(--sub)]">{label}</dt>
      <dd className="text-[14px] leading-[1.9] text-[var(--ink)]">{children}</dd>
    </div>
  );
}
