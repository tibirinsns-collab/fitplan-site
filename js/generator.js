// 筋トレメニュー自動作成ツール
// 目的・レベル・場所・頻度・時間から1週間分のメニューを組み立てる

// lv: 推奨する最低レベル（1=初心者 2=中級 3=上級） / sec: 回数ではなく秒数で行う種目
const EXERCISES = {
  chest: {
    label: "胸",
    gym: [
      { name: "ダンベルベンチプレス", lv: 1 },
      { name: "チェストプレス（マシン）", lv: 1 },
      { name: "バーベルベンチプレス", lv: 2 },
      { name: "インクラインダンベルプレス", lv: 2 },
      { name: "ケーブルフライ", lv: 2 },
    ],
    home: [
      { name: "膝つき腕立て伏せ", lv: 1 },
      { name: "腕立て伏せ", lv: 1 },
      { name: "ワイドプッシュアップ", lv: 2 },
      { name: "デクラインプッシュアップ（足を台に乗せる）", lv: 2 },
      { name: "アーチャープッシュアップ", lv: 3 },
    ],
  },
  back: {
    label: "背中",
    gym: [
      { name: "ラットプルダウン", lv: 1 },
      { name: "シーテッドロー", lv: 1 },
      { name: "ワンハンドダンベルロー", lv: 2 },
      { name: "懸垂（チンニング）", lv: 2 },
      { name: "デッドリフト", lv: 3 },
    ],
    home: [
      { name: "スーパーマン", lv: 1 },
      { name: "タオルラットプル", lv: 1 },
      { name: "テーブルロウ（机の下で斜め懸垂）", lv: 2 },
      { name: "リュックを使ったベントオーバーロウ", lv: 2 },
      { name: "懸垂（ドア枠バー）", lv: 3 },
    ],
  },
  legs: {
    label: "脚・お尻",
    gym: [
      { name: "レッグプレス", lv: 1 },
      { name: "ゴブレットスクワット", lv: 1 },
      { name: "バーベルスクワット", lv: 2 },
      { name: "ルーマニアンデッドリフト", lv: 2 },
      { name: "レッグカール", lv: 1 },
      { name: "ブルガリアンスクワット", lv: 2 },
    ],
    home: [
      { name: "自重スクワット", lv: 1 },
      { name: "ヒップリフト", lv: 1 },
      { name: "リバースランジ", lv: 1 },
      { name: "ブルガリアンスクワット", lv: 2 },
      { name: "片脚ヒップリフト", lv: 2 },
      { name: "ジャンプスクワット", lv: 3 },
    ],
  },
  shoulders: {
    label: "肩",
    gym: [
      { name: "ダンベルショルダープレス", lv: 1 },
      { name: "サイドレイズ", lv: 1 },
      { name: "リアデルトフライ（マシン）", lv: 2 },
    ],
    home: [
      { name: "ペットボトルサイドレイズ", lv: 1 },
      { name: "パイクプッシュアップ", lv: 2 },
      { name: "Y-Tレイズ（うつ伏せ）", lv: 1 },
    ],
  },
  armsPush: {
    label: "二の腕",
    gym: [
      { name: "トライセプスプッシュダウン", lv: 1 },
      { name: "ライイングトライセプスエクステンション", lv: 2 },
    ],
    home: [
      { name: "リバースプッシュアップ（椅子ディップス）", lv: 1 },
      { name: "ナロープッシュアップ", lv: 2 },
    ],
  },
  armsPull: {
    label: "力こぶ",
    gym: [
      { name: "ダンベルカール", lv: 1 },
      { name: "ハンマーカール", lv: 1 },
    ],
    home: [
      { name: "タオルカール", lv: 1 },
      { name: "リュックカール", lv: 1 },
    ],
  },
  core: {
    label: "体幹・お腹",
    gym: [
      { name: "プランク", lv: 1, sec: true },
      { name: "クランチ", lv: 1 },
      { name: "ケーブルクランチ", lv: 2 },
      { name: "アブローラー", lv: 3 },
    ],
    home: [
      { name: "プランク", lv: 1, sec: true },
      { name: "クランチ", lv: 1 },
      { name: "レッグレイズ", lv: 2 },
      { name: "サイドプランク", lv: 2, sec: true },
    ],
  },
};

// 1日の種類ごとに、鍛える部位を優先順に並べたもの
const DAY_TYPES = {
  full: { title: "全身", slots: ["legs", "chest", "back", "shoulders", "core", "armsPush"] },
  push: { title: "押す日（胸・肩・二の腕）", slots: ["chest", "shoulders", "chest", "armsPush", "shoulders", "core"] },
  pull: { title: "引く日（背中・力こぶ）", slots: ["back", "back", "armsPull", "core", "back", "armsPull"] },
  legs: { title: "脚の日", slots: ["legs", "legs", "legs", "core", "legs", "core"] },
  upper: { title: "上半身", slots: ["chest", "back", "shoulders", "armsPull", "armsPush", "core"] },
  lower: { title: "下半身", slots: ["legs", "legs", "core", "legs", "legs", "core"] },
};

const FALLBACK_SLOTS = ["core", "core", "shoulders", "armsPull", "armsPush"];

const GOALS = {
  muscle: {
    label: "筋肉を大きくしたい",
    reps: "8〜12回",
    sec: "30〜45秒",
    rest: "90秒",
    sets: [2, 3, 4],
    extra: "トレーニング後30分以内にたんぱく質（体重×0.4g目安）を補給しましょう。",
  },
  diet: {
    label: "引き締め・減量",
    reps: "12〜15回",
    sec: "30〜45秒",
    rest: "45秒",
    sets: [2, 3, 3],
    extra: "仕上げに有酸素運動15〜20分（早歩き・エアロバイクなど）",
  },
  health: {
    label: "体力づくり・健康維持",
    reps: "10〜15回",
    sec: "20〜30秒",
    rest: "60秒",
    sets: [2, 2, 3],
    extra: "最後に全身ストレッチを5分。呼吸を止めずに行いましょう。",
  },
};

const LEVEL_LABELS = ["", "初心者", "中級者", "上級者"];
const PLACE_LABELS = { gym: "ジム", home: "自宅" };
const WEEKDAYS = ["月", "火", "水", "木", "金", "土", "日"];
const SCHEDULE = { 2: [0, 3], 3: [0, 2, 4], 4: [0, 1, 3, 4], 5: [0, 1, 2, 4, 5] };
const SLOTS_BY_TIME = { 30: 4, 45: 5, 60: 6 };

// 頻度とレベルから1週間の分割方法を決める
function buildSplit(days, level) {
  if (days === 2) return [["full", 0], ["full", 1]];
  if (days === 3) {
    return level === 1
      ? [["full", 0], ["full", 1], ["full", 2]]
      : [["push", 0], ["pull", 0], ["legs", 0]];
  }
  if (days === 4) return [["upper", 0], ["lower", 0], ["upper", 1], ["lower", 1]];
  return [["push", 0], ["pull", 0], ["legs", 0], ["upper", 1], ["lower", 1]];
}

function buildDay(typeKey, variant, opts) {
  const type = DAY_TYPES[typeKey];
  const goal = GOALS[opts.goal];
  const count = SLOTS_BY_TIME[opts.time];
  const usedCount = {};
  const usedNames = new Set();
  const items = [];

  // 種目が足りない部位は飛ばし、補助の部位で埋める
  const slots = [...type.slots, ...FALLBACK_SLOTS];
  for (const part of slots) {
    if (items.length >= count) break;
    const pool = EXERCISES[part][opts.place].filter((ex) => ex.lv <= opts.level);
    usedCount[part] = (usedCount[part] || 0) + 1;
    // 同じ部位が2回目なら次の種目、A/B/Cの違いでも種目をずらす
    const start = usedCount[part] - 1 + variant * 2;
    const ex = pool
      .map((_, i) => pool[(start + i) % pool.length])
      .find((e) => !usedNames.has(e.name));
    if (!ex) continue;
    usedNames.add(ex.name);
    items.push({
      part: EXERCISES[part].label,
      name: ex.name,
      sets: goal.sets[opts.level - 1],
      reps: ex.sec ? goal.sec : goal.reps,
      rest: goal.rest,
    });
  }

  return { title: type.title, items, extra: goal.extra };
}

function generate(opts) {
  const split = buildSplit(opts.days, opts.level);
  const dayIdx = SCHEDULE[opts.days];
  return split.map(([type, variant], i) => {
    const day = buildDay(type, variant, opts);
    // 同じ種類の日が週に複数あるときは A/B/C で区別する
    const repeated = split.filter(([t]) => t === type).length > 1;
    if (repeated) day.title += " " + "ABC"[split.slice(0, i).filter(([t]) => t === type).length];
    return { weekday: WEEKDAYS[dayIdx[i]], ...day };
  });
}

function escapeHtml(s) {
  return s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
}

function render(opts, plan) {
  const activeDays = SCHEDULE[opts.days];
  const week = WEEKDAYS.map(
    (d, i) => `<div class="${activeDays.includes(i) ? "on" : ""}">${d}</div>`
  ).join("");

  const summary = `
    <div class="result-summary">
      <h2>あなた専用の1週間メニュー</h2>
      <dl>
        <div><dt>目的</dt><dd>${GOALS[opts.goal].label}</dd></div>
        <div><dt>レベル</dt><dd>${LEVEL_LABELS[opts.level]}</dd></div>
        <div><dt>場所</dt><dd>${PLACE_LABELS[opts.place]}</dd></div>
        <div><dt>1回</dt><dd>約${opts.time}分</dd></div>
      </dl>
      <div class="week" aria-label="トレーニングする曜日">${week}</div>
    </div>
    <p class="notice">種目名を押すと、やり方とポイントが表示されます。</p>`;

  const days = plan
    .map(
      (day) => `
    <article class="day-card">
      <header>
        <h3>${escapeHtml(day.title)}</h3>
        <span class="day-name">${day.weekday}曜日</span>
      </header>
      <table class="ex-table">
        <thead><tr><th>種目</th><th>セット</th><th>回数</th><th>休憩</th></tr></thead>
        <tbody>
          ${day.items
            .map(
              (it) => `<tr>
                <td><span class="part">${it.part}</span><br><button type="button" class="ex-link" data-ex="${escapeHtml(it.name)}">${escapeHtml(it.name)}</button></td>
                <td>${it.sets}</td><td>${it.reps}</td><td>${it.rest}</td>
              </tr>`
            )
            .join("")}
        </tbody>
      </table>
      <p class="day-extra">ウォームアップ：軽い足踏み・肩回しを5分 ／ ${escapeHtml(day.extra)}</p>
    </article>`
    )
    .join("");

  const actions = `
    <div class="result-actions">
      <button type="button" class="btn btn-outline" onclick="window.print()">メニューを印刷する</button>
      <a class="btn btn-primary" href="service.html">記録・自動更新はアプリで</a>
    </div>
    <p class="notice">※ 本メニューは一般的なトレーニング指針にもとづく目安です。体調や持病に不安がある方は医師に相談のうえ、無理のない範囲で行ってください。</p>`;

  return summary + days + actions;
}

// 種目解説のポップアップ
function openGuide(name) {
  const guide = EXERCISE_GUIDE[name];
  const dialog = document.getElementById("ex-dialog");
  if (!guide || !dialog) return;
  dialog.querySelector(".dialog-body").innerHTML = `
    <span class="part">${escapeHtml(guide.target)}</span>
    <h2>${escapeHtml(name)}</h2>
    <h3>やり方</h3>
    <ol>${guide.steps.map((s) => `<li>${escapeHtml(s)}</li>`).join("")}</ol>
    <h3>ポイント</h3>
    <p>${escapeHtml(guide.point)}</p>`;
  dialog.showModal();
}

// 種目図鑑：部位ごとに全種目を一覧表示
function renderLibrary(part) {
  const list = document.getElementById("library-list");
  const names = [...new Set([...EXERCISES[part].gym, ...EXERCISES[part].home].map((ex) => ex.name))];
  list.innerHTML = names
    .map((name) => {
      const ex = [...EXERCISES[part].gym, ...EXERCISES[part].home].find((e) => e.name === name);
      const places = ["gym", "home"].filter((p) => EXERCISES[part][p].some((e) => e.name === name));
      return `<button type="button" class="library-item ex-link" data-ex="${escapeHtml(name)}">
        <strong>${escapeHtml(name)}</strong>
        <span>${places.map((p) => PLACE_LABELS[p]).join("・")} ／ ${LEVEL_LABELS[ex.lv]}〜</span>
      </button>`;
    })
    .join("");
}

document.addEventListener("click", (e) => {
  const link = e.target.closest(".ex-link");
  if (link) openGuide(link.dataset.ex);
});

document.addEventListener("DOMContentLoaded", () => {
  const dialog = document.getElementById("ex-dialog");
  if (dialog) {
    dialog.querySelector(".dialog-close").addEventListener("click", () => dialog.close());
    // 背景（ダイアログの外側）を押しても閉じる
    dialog.addEventListener("click", (e) => {
      if (e.target === dialog) dialog.close();
    });
  }

  const tabs = document.querySelectorAll(".library-tabs button");
  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((t) => t.setAttribute("aria-selected", String(t === tab)));
      renderLibrary(tab.dataset.part);
    });
  });
  if (tabs.length) renderLibrary(tabs[0].dataset.part);

  const form = document.getElementById("menu-form");
  const result = document.getElementById("result");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const opts = {
      goal: fd.get("goal"),
      level: Number(fd.get("level")),
      place: fd.get("place"),
      days: Number(fd.get("days")),
      time: Number(fd.get("time")),
    };
    result.innerHTML = render(opts, generate(opts));
    if (window.innerWidth <= 960) {
      result.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });
});
