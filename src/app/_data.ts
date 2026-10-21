/* ============================================================================
 * éto（架空・ひとりずつ施術するプライベートのネイルサロン）の共有データ。
 *
 * **表側の3画面と管理の4画面が、ここだけを見る。**
 * 複製すると、料金や施術時間を1か所だけ直したときに画面ごとに違う値が出る
 * ——という形で静かに壊れる。書き出した画面（public/works/eto/）の数字は
 * すべてこのファイルから再現できる。
 *
 * ■ この店でいちばん大事な決め事
 *   **時間と金額を必ず対にする。**料金だけ変えて施術時間を直し忘れると、
 *   その日の枠が合わなくなる（前の人が終わらないうちに次の人が来る）。
 *   だから MENUS は分と円を1つのオブジェクトで持ち、合計も
 *   `selection()` が**両方を同時に**返す。片方だけ取り出す関数は置かない。
 *
 * 置いてよいのは次のものだけ:
 *  - React にもブラウザ API にも依存しない定数
 *  - 引数だけで結果が決まる純粋関数（SSR と CSR で必ず同じ値になる＝
 *    ハイドレーションのずれが出ない）
 * 日付ライブラリは使わない（`@/components/site/calendar` の整数演算）。
 *
 * 「今日」を端末時計から取らない。店の「本日」は TODAY 定数にしてある。
 * ==========================================================================*/

import {
  DOW_JA,
  dayOfWeek,
  parseDate,
} from '@/components/site/calendar';

/** 店で「本日」とする日。書き出した管理画面の 2026年10月3日（土）。 */
export const TODAY = '2026-10-03';

/** 営業時間と定休日。トップ・メニュー・フッターで同じ値を出す。 */
export const OPEN_HOURS = '11:00–20:00';
export const CLOSED_DAY = '火曜定休';

/* ---------------------------------------------------------------------------
 * メニュー
 * ------------------------------------------------------------------------- */

export type MenuId = 'onecolor' | 'magnet' | 'french' | 'design' | 'handcare';

export type Menu = {
  id: MenuId;
  name: string;
  /** 施術時間（分）。**料金と必ず対にする。** */
  minutes: number;
  price: number;
  note: string;
};

/** 並びは書き出したメニュー表と同じ。 */
export const MENUS: readonly Menu[] = [
  {
    id: 'onecolor',
    name: 'ワンカラー',
    minutes: 60,
    price: 6600,
    note: '色見本からお好きな色を1色お選びください。',
  },
  {
    id: 'magnet',
    name: 'マグネット',
    minutes: 75,
    price: 7700,
    note: '磁石で模様を出すジェル。光の当たり方で表情が変わります。',
  },
  {
    id: 'french',
    name: 'フレンチ',
    minutes: 90,
    price: 8800,
    note: '爪先のラインの幅と色をご相談しながら決めます。',
  },
  {
    id: 'design',
    name: 'デザイン',
    minutes: 90,
    price: 8800,
    note: 'お持ち込みの画像や、その場のご相談でお作りします。',
  },
  {
    id: 'handcare',
    name: 'ハンドケア',
    minutes: 40,
    price: 4400,
    note: '甘皮の処理と保湿だけの回です。ジェルは塗りません。',
  },
];

export function menu(id: MenuId): Menu {
  const m = MENUS.find((x) => x.id === id);
  if (!m) throw new Error(`unknown menu: ${id}`);
  return m;
}

export function isMenuId(value: string | null): value is MenuId {
  return MENUS.some((x) => x.id === value);
}

/** すべてケア込み・税込。メニュー表の上に出す1行。 */
export const MENU_NOTE =
  'すべてケア込み・税込です。ジェルの付け替えオフは別途お選びください。';

/* ---------------------------------------------------------------------------
 * 付け替えオフ
 * ------------------------------------------------------------------------- */

export type OffId = 'none' | 'ours' | 'other';

export type Off = {
  id: OffId;
  label: string;
  /** 追加の施術時間（分）。 */
  minutes: number;
  price: number;
};

/**
 * 当店で付けたジェルを外すのは無料、よそで付けたものは ¥1,100。
 * **どちらも30分かかる。**金額が0でも時間は0にならないので、
 * 「無料だから枠も要らない」と読める形にはしない。
 */
export const OFFS: readonly Off[] = [
  { id: 'none', label: 'なし', minutes: 0, price: 0 },
  { id: 'ours', label: '当店', minutes: 30, price: 0 },
  { id: 'other', label: '他店', minutes: 30, price: 1100 },
];

export function off(id: OffId): Off {
  const o = OFFS.find((x) => x.id === id);
  if (!o) throw new Error(`unknown off: ${id}`);
  return o;
}

export function isOffId(value: string | null): value is OffId {
  return OFFS.some((x) => x.id === value);
}

/** メニュー表の下に出す1行。 */
export const OFF_NOTE = '付け替えオフ：当店 ¥0 / 他店 ¥1,100（＋30分）';

/* ---------------------------------------------------------------------------
 * 合計（時間と金額は必ず一緒に動く）
 * ------------------------------------------------------------------------- */

export type Selection = {
  minutes: number;
  price: number;
  /** 「ワンカラー＋他店オフ」のような1行。 */
  label: string;
};

/**
 * 選んだ内容の合計。**分と円を同時に返す。**
 * ワンカラー（60分 ¥6,600）＋他店オフ（30分 ¥1,100）＝ 90分 ¥7,700。
 */
export function selection(menuId: MenuId, offId: OffId): Selection {
  const m = menu(menuId);
  const o = off(offId);
  return {
    minutes: m.minutes + o.minutes,
    price: m.price + o.price,
    label: offId === 'none' ? m.name : `${m.name}＋${o.label}オフ`,
  };
}

/**
 * 予約枠の候補。**分と円を対にしたものしか選べないようにする。**
 * 管理画面の「メニュー・予約枠」は、この一覧から1つを選ぶ形にしてある。
 * 料金だけの欄と施術時間だけの欄に分けると、料金を変えて時間を直し忘れる
 * ——その日の枠が合わなくなる、という事故が起きる。
 */
export const SLOT_PRESETS: readonly { minutes: number; price: number }[] = [
  { minutes: 40, price: 4400 },
  { minutes: 60, price: 6600 },
  { minutes: 75, price: 7700 },
  { minutes: 90, price: 8800 },
  { minutes: 105, price: 9900 },
  { minutes: 120, price: 11000 },
];

/** `60分 / ¥6,600`。欄に出す1行。 */
export function presetLabel(minutes: number, price: number): string {
  return `${minutes}分 / ¥${String(price).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
}

/* ---------------------------------------------------------------------------
 * 時刻（`HH:MM` の整数演算だけ。Date も日付ライブラリも使わない）
 * ------------------------------------------------------------------------- */

export function toMinutes(hhmm: string): number {
  const m = /^(\d{1,2}):(\d{2})$/.exec(hhmm);
  if (!m) return 0;
  return Number(m[1]) * 60 + Number(m[2]);
}

export function fromMinutes(total: number): string {
  const h = Math.floor(total / 60);
  const m = total % 60;
  return `${h}:${String(m).padStart(2, '0')}`;
}

/** 開始時刻 + 所要時間 → 終了時刻。14:00 + 90分 = 15:30。 */
export function endTime(start: string, minutes: number): string {
  return fromMinutes(toMinutes(start) + minutes);
}

/** `14:00–15:30`。区切りは全角のダッシュではなく en dash。 */
export function timeRange(start: string, minutes: number): string {
  return `${start}–${endTime(start, minutes)}`;
}

/**
 * `10月3日（土）`。年を落とした短い形。
 * 店の「本日」は1日しか持っていないので、年は上の帯にだけ出す。
 * 曜日の計算は `site/calendar.ts` の整数演算（Date は使わない）。
 */
export function visitDateLabel(iso: string = TODAY): string {
  const c = parseDate(iso);
  const dow = dayOfWeek(iso);
  if (!c || dow === null) return iso;
  return `${c.m}月${c.d}日（${DOW_JA[dow]}）`;
}

/* ---------------------------------------------------------------------------
 * 今月のデザイン
 * ------------------------------------------------------------------------- */

export const DESIGNS: readonly {
  no: string;
  /** 欧文だけの名前。和文と混ぜない（別書体になるため）。 */
  name: string;
  menuId: MenuId;
  tone: string;
  /** 手元の写真（public/samples/ からの拡張子なしの道）。 */
  photo: string;
}[] = [
  { no: '01', name: 'Sheer rose', menuId: 'onecolor', tone: 'eto-nail-1', photo: 'eto/nail-1' },
  { no: '02', name: 'Fine french', menuId: 'french', tone: 'eto-nail-2', photo: 'eto/nail-2' },
  { no: '03', name: 'Champagne light', menuId: 'magnet', tone: 'eto-nail-3', photo: 'eto/nail-3' },
];

/* ---------------------------------------------------------------------------
 * 担当者と予約カレンダー
 * ------------------------------------------------------------------------- */

export type StaffId = 'sasaki' | 'takahashi' | 'tanaka';

export const STAFF: readonly { id: StaffId; name: string }[] = [
  { id: 'sasaki', name: '佐々木' },
  { id: 'takahashi', name: '高橋' },
  { id: 'tanaka', name: '田中' },
];

export function staffName(id: StaffId): string {
  const s = STAFF.find((x) => x.id === id);
  if (!s) throw new Error(`unknown staff: ${id}`);
  return s.name;
}

export function isStaffId(value: string | null): value is StaffId {
  return STAFF.some((x) => x.id === value);
}

/** 予約を受ける時間。11:00 から 16:00 まで1時間ごと。 */
export const HOURS: readonly string[] = [
  '11:00',
  '12:00',
  '13:00',
  '14:00',
  '15:00',
  '16:00',
];

export type Cell =
  | {
      kind: 'booked';
      /** 予約番号。表側の流れが作ろうとしている1件だけ id を持つ。 */
      id?: string;
      guest: string;
      /** 「ワンカラー＋他店オフ」など。 */
      what: string;
      minutes: number;
      /** 初めてのお客様か。上の「初めてのお客様」はこれを数えている。 */
      first?: boolean;
    }
  | { kind: 'busy' }
  | { kind: 'break' }
  | { kind: 'open' };

/** 表側の流れが最後にたどり着く1件の予約番号。 */
export const FEATURED_ID = 'ET-1003-014';

/**
 * 本日の枠。行が時刻、列が STAFF の並び。
 *
 * `busy`（施術中）は**前の枠から続いている時間**で、予約の件数には数えない。
 * 11:00 の山本様（デザイン90分）が 12:30 まで、13:00 の佐藤様（フレンチ90分）が
 * 14:30 まで、14:00 の山田様（90分）が 15:30 までかかっている。
 */
export const SLOTS: readonly { time: string; cells: readonly Cell[] }[] = [
  {
    time: '11:00',
    cells: [
      { kind: 'booked', guest: '井上 様', what: 'ハンドケア', minutes: 40 },
      { kind: 'open' },
      { kind: 'booked', guest: '山本 様', what: 'デザイン', minutes: 90 },
    ],
  },
  {
    time: '12:00',
    cells: [
      { kind: 'booked', guest: '田口 様', what: 'ワンカラー', minutes: 60 },
      { kind: 'break' },
      { kind: 'busy' },
    ],
  },
  {
    time: '13:00',
    cells: [
      { kind: 'break' },
      { kind: 'booked', guest: '佐藤 様', what: 'フレンチ', minutes: 90 },
      { kind: 'break' },
    ],
  },
  {
    time: '14:00',
    cells: [
      {
        kind: 'booked',
        id: FEATURED_ID,
        guest: '山田 花子 様',
        what: 'ワンカラー＋他店オフ',
        minutes: 90,
        first: true,
      },
      { kind: 'busy' },
      { kind: 'open' },
    ],
  },
  {
    time: '15:00',
    cells: [
      { kind: 'busy' },
      { kind: 'booked', guest: '木下 様', what: 'ワンカラー', minutes: 60, first: true },
      { kind: 'break' },
    ],
  },
  {
    time: '16:00',
    cells: [
      { kind: 'open' },
      { kind: 'booked', guest: '中村 様', what: 'マグネット', minutes: 75 },
      { kind: 'booked', guest: '小林 様', what: 'ワンカラー', minutes: 60 },
    ],
  },
];

/** 本日の予約件数。`busy`（続きの時間）は数えない。 */
export function bookedCount(): number {
  return SLOTS.reduce(
    (n, row) => n + row.cells.filter((c) => c.kind === 'booked').length,
    0,
  );
}

/** 空き枠。 */
export function openCount(): number {
  return SLOTS.reduce(
    (n, row) => n + row.cells.filter((c) => c.kind === 'open').length,
    0,
  );
}

/** 初めてのお客様。 */
export function firstTimeCount(): number {
  return SLOTS.reduce(
    (n, row) =>
      n + row.cells.filter((c) => c.kind === 'booked' && c.first).length,
    0,
  );
}

/**
 * 空いている時刻。
 *
 * `ignoreId` を渡すと、その予約が**まだ入っていない**ものとして数える。
 * 表側の予約画面は、いま作ろうとしている1件（ET-1003-014）を除いた空きを
 * 出す必要があるため。管理画面のカレンダーは `ignoreId` なしで呼ぶので、
 * 予約が入ったあとの姿になる。同じ台帳から、前と後の2つの画面が出る。
 */
export function openTimes(
  staff: StaffId | null,
  ignoreId?: string,
): readonly string[] {
  const index = staff ? STAFF.findIndex((s) => s.id === staff) : -1;
  return SLOTS.filter((row) => {
    const cells = index >= 0 ? [row.cells[index]] : row.cells;
    return cells.some(
      (c) =>
        c.kind === 'open' ||
        (c.kind === 'booked' && ignoreId !== undefined && c.id === ignoreId),
    );
  }).map((row) => row.time);
}

/* ---------------------------------------------------------------------------
 * 予約 ET-1003-014（表側の流れと、管理の予約詳細で同じものを見る）
 * ------------------------------------------------------------------------- */

export type ReserveStatus = 'booked' | 'done' | 'canceled' | 'noshow';

export const RESERVE_STATUS: readonly { id: ReserveStatus; label: string }[] = [
  { id: 'booked', label: '予約済み' },
  { id: 'done', label: '来店済み' },
  { id: 'canceled', label: 'キャンセル' },
  { id: 'noshow', label: '無断キャンセル' },
];

export function statusLabel(id: ReserveStatus): string {
  const s = RESERVE_STATUS.find((x) => x.id === id);
  if (!s) throw new Error(`unknown status: ${id}`);
  return s.label;
}

export const FEATURED = {
  id: FEATURED_ID,
  guest: '山田 花子',
  start: '14:00',
  menuId: 'onecolor' as MenuId,
  offId: 'other' as OffId,
  staff: 'sasaki' as StaffId,
  status: 'booked' as ReserveStatus,
  memo: '短めの長さをご希望。初回来店。',
} as const;

/** お支払い。当日、店頭で。オンライン決済は扱わない。 */
export const PAYMENT_NOTE = '当日店頭';

/** 変更・キャンセルの条件。確認の前に必ず出す。 */
export const CHANGE_POLICY: readonly string[] = [
  '変更・キャンセルは前日18:00までにお願いします。',
  '当日のご連絡は確認メールの連絡先へお願いします。',
];

/** 予約の前に出す短い案内。 */
export const BEFORE_VISIT: readonly string[] = [
  '当日は予約時間の5分前を目安にお越しください。',
  '色は当日変更できます。',
];

/** ご来店について。 */
export const VISIT_KIND: readonly { id: string; label: string }[] = [
  { id: 'first', label: '初めて' },
  { id: 'again', label: '2回目以降' },
];

/** 担当（管理画面の右上）と、最終更新。 */
export const STAFF_ON_DUTY = '店舗スタッフ';
export const LAST_UPDATED = '10月3日 09:15';
