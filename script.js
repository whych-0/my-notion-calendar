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

  const isSameYMD = (a, b) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  // ====== FullCalendar 初期化 ======
  const calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: "dayGridMonth",           // 既定＝月
    headerToolbar: false,
    height: "100%",
    expandRows: true,
    stickyHeaderDates: true,
    firstDay: 0,                            // 0=日曜開始
    navLinks: true,
    nowIndicator: true,                     // 週ビューの現在時刻赤ライン
    slotMinTime: "07:00:00",
    slotMaxTime: "23:00:00",
    slotDuration: "01:00:00",
    slotLabelInterval: "01:00",
    slotLabelFormat: { hour: "2-digit", minute: "2-digit", hour12: false },
    dayMaxEventRows: 3,
    displayEventTime: true,
    eventTimeFormat: { hour: "2-digit", minute: "2-digit", hour12: false },

    // i18n
    locale: "ja",
    buttonText: { today: "今日", month: "月", week: "週" },

    // ====== 週ビューのヘッダ（曜日／日を縦並び・月は出さない） ======
    views: {
      timeGridWeek: {
        dayHeaderContent: (args) => {
          const d = args.date;
          const dow = d.toLocaleDateString("ja-JP", { weekday: "short" }); // 月, 火, ...
          const dom = d.getDate(); // 1..31
          return {
            html: `
              <div class="fc-wkhead">
                <div class="fc-wkhead-dow">${dow}</div>
                <div class="fc-wkhead-dom"><span class="fc-oval">${dom}</span></div>
              </div>
            `
          };
        },
        // all-day ラベルを消す
        allDayText: ""
      }
    },

    // ====== イベント取得（GAS→Notion） ======
    events: async function (fetchInfo, success, failure) {
      try {
        const GAS_URL = "https://script.google.com/macros/s/AKfycbwCfcnmvNtqKOGSNLqv7EcUq3A0wXcaeHJhgGT17vJX6y3jNBhk9zPcS84bTP4LbA7Gsw/exec";
        const res = await fetch(GAS_URL);
        const data = await res.json();

        const events = (data.results || [])
          .map((page) => {
            const title = page?.properties?.タイトル?.title?.[0]?.plain_text || "無題";
            const date = page?.properties?.実行日?.date?.start;
            if (!date) return null;
            return {
              title,
              start: date,
              url: page?.url || undefined
            };
          })
          .filter(Boolean);

        success(events);
      } catch (err) {
        console.error("データの取得に失敗しました", err);
        failure(err);
      }
    },

    // ====== イベントの見た目（青ピル風） ======
    eventDidMount: ({ el }) => {
      el.classList.add(
        "rounded", "px-1", "py-0.5",
        "text-white", "bg-primary",
        "dark:text-black"
      );
      const titleElt = el.querySelector(".fc-event-title");
      if (titleElt) titleElt.classList.add("font-medium");
    },

    // ====== 月セル：数字中央寄せ & 今日だけ楕円ハイライト ======
    dayCellDidMount: (info) => {
      // 月ビューのセル先頭（数字）の中央寄せは CSS で制御
      // 「今日」だけ数字の周囲にピルを付ける
      if (info.isToday) {
        const a = info.el.querySelector(".fc-daygrid-day-number");
        if (a) a.classList.add("is-today-number");
      }
    },

    // ====== 週ヘッダ：今日だけ楕円ハイライト ======
    dayHeaderDidMount: (info) => {
      if (isSameYMD(info.date, new Date())) {
        info.el.classList.add("is-today-header");
      }
    },

    // 外部ヘッダーのタイトル更新
    datesSet: () => updateExternalTitle()
  });

  calendar.render();

  // ====== 外部ヘッダーの制御 ======
  function updateExternalTitle() {
    const d = calendar.getDate();
    titleEl.textContent = d.toLocaleDateString("ja-JP", { year: "numeric", month: "long" }); // 例: 2025年9月
    const isMonth = calendar.view.type === "dayGridMonth";
    btnMonth.classList.toggle("bg-secondary-light", isMonth);
    btnMonth.classList.toggle("dark:bg-secondary-dark", isMonth);
    btnWeek.classList.toggle("bg-secondary-light", !isMonth);
    btnWeek.classList.toggle("dark:bg-secondary-dark", !isMonth);
  }

  btnPrev.addEventListener("click", () => { calendar.prev(); updateExternalTitle(); });
  btnNext.addEventListener("click", () => { calendar.next(); updateExternalTitle(); });
  btnToday.addEventListener("click", () => { calendar.today(); updateExternalTitle(); });
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
