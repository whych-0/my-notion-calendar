// DOM 準備
document.addEventListener("DOMContentLoaded", function () {
  const calendarEl = document.getElementById("calendar");

  // ====== 外部ヘッダー要素 ======
  const titleEl = document.getElementById("currentTitle");
  const btnPrev = document.getElementById("btnPrev");
  const btnNext = document.getElementById("btnNext");
  const btnToday = document.getElementById("btnToday");
  const btnWeek = document.getElementById("btnWeek");
  const btnMonth = document.getElementById("btnMonth");

  // ====== FullCalendar 初期化 ======
  const calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: "dayGridMonth",           // 既定＝月
    headerToolbar: false,                   // 内蔵ヘッダーは使わない
    height: "100%",
    expandRows: true,
    stickyHeaderDates: true,
    firstDay: 0,                            // 日曜開始（必要なら 1=月曜）
    navLinks: true,
    nowIndicator: true,                     // 週ビューで「現在時刻」赤ライン
    slotMinTime: "07:00:00",                // 週ビューの開始時刻（UIの例に合わせる）
    slotMaxTime: "23:00:00",
    slotDuration: "01:00:00",
    slotLabelInterval: "01:00",
    dayMaxEventRows: 3,                     // 月ビューでの折りたたみ
    displayEventTime: true,
    eventTimeFormat: { hour: "2-digit", minute: "2-digit", hour12: false },

    // i18n
    locale: "ja",
    buttonText: { today: "今日", month: "月", week: "週" },

    // ====== イベント取得（GAS→Notion） ======
    events: async function (fetchInfo, success, failure) {
      try {
        // 既存の GAS Web App URL をそのまま利用
        const GAS_URL = "https://script.google.com/macros/s/AKfycbwCfcnmvNtqKOGSNLqv7EcUq3A0wXcaeHJhgGT17vJX6y3jNBhk9zPcS84bTP4LbA7Gsw/exec";

        const res = await fetch(GAS_URL);
        const data = await res.json();

        // 既存のマッピングを維持（タイトル/実行日）
        // ※ NotionページのURLがある場合は event.url として開けるように付与
        const events = (data.results || [])
          .map((page) => {
            const title = page?.properties?.タイトル?.title?.[0]?.plain_text || "無題";
            const date = page?.properties?.実行日?.date?.start;
            if (!date) return null;
            return {
              title,
              start: date,
              url: page?.url || undefined,
            };
          })
          .filter(Boolean);

        success(events);
      } catch (err) {
        console.error("データの取得に失敗しました", err);
        failure(err);
      }
    },

    // ====== 装飾：monthly/weekly の雰囲気に寄せる ======
    eventDidMount: ({ el, event }) => {
      // 丸角とフォントを強め、ひな型の “青ピル” に寄せた外観
      el.classList.add(
        "rounded", "px-1", "py-0.5",
        "text-white", "bg-primary",
        "dark:text-black"
      );
      // 月ビューでの1行要約を保ちつつ、タイトルを強調
      const titleElt = el.querySelector(".fc-event-title");
      if (titleElt) titleElt.classList.add("font-medium");
    },

    // ヘッダーのタイトルを制御（外部ヘッダー）
    datesSet: () => updateExternalTitle()
  });

  calendar.render();

  // ====== 外部ヘッダーの制御 ======
  function updateExternalTitle() {
    const d = calendar.getDate();
    // 例）2025年 9月
    titleEl.textContent = d.toLocaleDateString("ja-JP", { year: "numeric", month: "long" });
    // ビューボタンの見た目更新
    const isMonth = calendar.view.type === "dayGridMonth";
    btnMonth.classList.toggle("bg-secondary-light", isMonth);
    btnMonth.classList.toggle("dark:bg-secondary-dark", isMonth);
    btnWeek.classList.toggle("bg-secondary-light", !isMonth);
    btnWeek.classList.toggle("dark:bg-secondary-dark", !isMonth);
  }

  btnPrev.addEventListener("click", () => {
    calendar.prev();
    updateExternalTitle();
  });

  btnNext.addEventListener("click", () => {
    calendar.next();
    updateExternalTitle();
  });

  btnToday.addEventListener("click", () => {
    calendar.today();
    updateExternalTitle();
  });

  btnWeek.addEventListener("click", () => {
    if (calendar.view.type !== "timeGridWeek") {
      calendar.changeView("timeGridWeek");
      updateExternalTitle();
    }
  });

  btnMonth.addEventListener("click", () => {
    if (calendar.view.type !== "dayGridMonth") {
      calendar.changeView("dayGridMonth");
      updateExternalTitle();
    }
  });
});
