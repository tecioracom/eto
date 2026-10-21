'use client';

import { useId, useRef, useState, type ReactNode } from 'react';
import { AdminCard } from '@/components/site/AdminShell';
import {
  ErrorSummary,
  SelectField,
  TextAreaField,
} from '@/components/site/fields';
import { yen } from '@/components/site/format';
import { listErrors, trim, type FieldError } from '@/components/site/validate';
import {
  FEATURED,
  LAST_UPDATED,
  PAYMENT_NOTE,
  RESERVE_STATUS,
  STAFF,
  STAFF_ON_DUTY,
  menu,
  off,
  selection,
  staffName,
  statusLabel,
  timeRange,
  visitDateLabel,
  type ReserveStatus,
  type StaffId,
} from '../../../_data';
import { ETO_BTN, ETO_BTN_LINE } from '../../../_ui';
import { SitePhoto } from '@/components/site/SitePhoto';

/* ============================================================================
 * 予約の詳細。**保存はしない。終点は「変更内容の確認」。**
 *
 * ■ 担当を変えると、その担当の枠が要る
 *   この見本では 14:00 に空いているのは佐々木だけなので、ほかの担当に
 *   変えると**その場で赤い注意が出る**。保存を押してから気づく形にすると、
 *   すでにお客様には別の案内が届いている。
 *
 * ■ キャンセルにするなら理由をメモに残す
 *   あとで電話が来たときに、誰がなぜ取り消したのかが分からないと答えられない。
 *   ここで止められる事故なので、ここで止める。
 * ==========================================================================*/

const FIELD_ORDER = ['status', 'staff', 'memo'] as const;

const FIELD_LABELS: Record<string, string> = {
  status: 'ステータス',
  staff: '担当',
  memo: 'スタッフメモ',
};

/** この見本が持っている「14:00 に空いている担当」。 */
const FREE_AT_START: readonly StaffId[] = ['sasaki'];

export function ReservationDetail() {
  const uid = useId().replace(/:/g, '');
  const id = (k: string) => `${uid}-${k}`;
  const summaryRef = useRef<HTMLDivElement>(null);

  const sel = selection(FEATURED.menuId, FEATURED.offId);

  const [status, setStatus] = useState<ReserveStatus>(FEATURED.status);
  const [staff, setStaff] = useState<StaffId>(FEATURED.staff);
  const [memo, setMemo] = useState<string>(FEATURED.memo);

  const [checked, setChecked] = useState(false);
  const [reviewing, setReviewing] = useState(false);

  const staffBusy = !FREE_AT_START.includes(staff);

  const errors: Record<string, FieldError> = {
    status: null,
    staff: staffBusy
      ? `${staffName(staff)}は ${FEATURED.start} の枠が空いていません。担当を戻すか、時間を変えてご連絡ください。`
      : null,
    memo:
      (status === 'canceled' || status === 'noshow') && trim(memo) === FEATURED.memo
        ? 'キャンセルにするときは、理由をスタッフメモに書き足してください。'
        : null,
  };

  const items = checked ? listErrors(FIELD_ORDER, errors, FIELD_LABELS) : [];
  const err = (k: string) => (checked ? (errors[k] ?? null) : null);

  const changes: string[] = [];
  if (status !== FEATURED.status) {
    changes.push(
      `ステータス：${statusLabel(FEATURED.status)} → ${statusLabel(status)}`,
    );
  }
  if (staff !== FEATURED.staff) {
    changes.push(`担当：${staffName(FEATURED.staff)} → ${staffName(staff)}`);
  }
  if (trim(memo) !== FEATURED.memo) {
    changes.push(
      `スタッフメモ：${FEATURED.memo} → ${trim(memo) === '' ? '（空）' : trim(memo)}`,
    );
  }

  function onReview() {
    setChecked(true);
    if (FIELD_ORDER.some((k) => errors[k])) {
      setReviewing(false);
      window.requestAnimationFrame(() => summaryRef.current?.focus());
      return;
    }
    setReviewing(true);
    window.requestAnimationFrame(() => {
      document.getElementById(id('review-head'))?.focus();
    });
  }

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
            変更されている項目はありません。ステータス{' '}
            {statusLabel(FEATURED.status)} / 担当 {staffName(FEATURED.staff)} /
            スタッフメモ「{FEATURED.memo}」のままです。
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
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_300px]">
      <div className="min-w-0">
        <div className="bg-[var(--soft)] px-5 py-5">
          <h2 className="text-[17px] text-[var(--soft-ink)]">受付内容</h2>
          <dl className="mt-4 space-y-3 text-[13px]">
            <Row label="日時">
              {visitDateLabel()} {timeRange(FEATURED.start, sel.minutes)}
            </Row>
            <Row label="施術">
              {menu(FEATURED.menuId).name}＋{off(FEATURED.offId).label}オフ
            </Row>
            <Row label="担当">{staffName(FEATURED.staff)}</Row>
            <Row label="合計">
              {yen(sel.price)} / {PAYMENT_NOTE}支払い
            </Row>
          </dl>
        </div>

        <AdminCard className="mt-4">
          <div role="group" aria-label="予約の編集">
            {items.length > 0 && (
              <div ref={summaryRef} className="mb-6">
                <ErrorSummary
                  id={id('summary')}
                  title={`入力を確認してください（${items.length}件）`}
                  items={items}
                  fieldId={(k) => id(k)}
                />
              </div>
            )}

            <div className="space-y-5">
              <TextAreaField
                id={id('memo')}
                label="スタッフメモ"
                value={memo}
                onChange={setMemo}
                rows={2}
                error={err('memo')}
                hint="お客様には出しません。この画面を離れると消えます。"
              />
              <SelectField
                id={id('status')}
                label="ステータス"
                value={status}
                onChange={(v) => setStatus(v as ReserveStatus)}
                options={RESERVE_STATUS.map((s) => ({ value: s.id, label: s.label }))}
                error={err('status')}
              />
              <SelectField
                id={id('staff')}
                label="担当"
                value={staff}
                onChange={(v) => setStaff(v as StaffId)}
                options={STAFF.map((s) => ({ value: s.id, label: s.name }))}
                error={err('staff')}
                hint={`${FEATURED.start} から ${sel.minutes}分ぶんの枠が要ります。`}
              />
            </div>

            <button type="button" onClick={onReview} className={`${ETO_BTN} mt-6`}>
              変更を保存
            </button>
            <p className="mt-3 text-[12px] leading-[1.8] text-[var(--sub)]">
              押すと変更内容の確認に進みます。この画面では保存されません。
            </p>
          </div>
        </AdminCard>
      </div>

      <div>
        <SitePhoto
          src="eto/nail-1"
          width={1000}
          height={750}
          eager
          className="eto-nail-1 aspect-[4/3] w-full rounded-[2px]"
        />
        <p className="mt-3 text-[12px] leading-[1.8] text-[var(--sub)]">
          更新者：{STAFF_ON_DUTY}
          <br />
          最終更新 {LAST_UPDATED}
        </p>
      </div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid gap-1 sm:grid-cols-[110px_minmax(0,1fr)] sm:gap-4">
      <dt className="text-[var(--soft-ink)]">{label}</dt>
      <dd className="text-[var(--soft-ink)]">{children}</dd>
    </div>
  );
}
