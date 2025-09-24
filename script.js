document.addEventListener('DOMContentLoaded', function() {
    const calendarEl = document.getElementById('calendar');

    // FullCalendarの初期化
    const calendar = new FullCalendar.Calendar(calendarEl, {
        // --- UI/UX関連の設定 ---
        initialView: 'dayGridMonth', // 初期表示は月表示
        locale: 'ja', // 日本語化
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek' // 月表示と週表示の切り替えボタン
        },
        buttonText: { // ボタンのテキストを日本語に
            today: '今日',
            month: '月',
            week: '週',
        },
        
        // --- 週表示(timeGridWeek)の見た目を参考ファイルに近づける設定 ---
        allDayText: '終日', // 「all-day」を「終日」に変更
        slotDuration: '01:00:00', // タイムグリッドの刻みを1時間
        slotLabelInterval: '01:00', // タイムグリッドのラベルを1時間ごとに表示
        slotLabelFormat: { // 時間の表示形式
            hour: '2-digit',
            minute: '2-digit',
            omitZeroMinute: true,
            meridiem: false,
            hour12: false
        },
        nowIndicator: true, // 現在時刻のインジケーターを表示

        // --- 月表示(dayGridMonth)の見た目を参考ファイルに近づける設定 ---
        dayHeaderFormat: { weekday: 'short' }, // 曜日を '日', '月'... の形式で表示
        
        // --- インタラクション設定 ---
        navLinks: true, // 日付や週番号をクリックしてビューを移動できるようにする
        selectable: true, // 日付範囲を選択できるようにする
        
        height: 'auto', // コンテンツの高さに合わせる
        
        // --- イベントクリック時の動作 ---
        eventClick: function(info) {
            // イベントをクリックしたときの動作を定義
            // info.event.title, info.event.start などでイベント情報にアクセスできる
            // 今はコンソールに表示するだけだが、将来的に詳細表示モーダルなどを開くことができる
            console.log('イベントがクリックされました:', info.event);
        },
        
        // --- 日付クリック時の動作 ---
        dateClick: function(info) {
            // 日付をクリックしたときの動作を定義
            // info.dateStr にはクリックされた日付の文字列が入っている
            // 将来的に新規イベント作成モーダルなどを開くことができる
            console.log('日付がクリックされました:', info.dateStr);
        },

        // --- データ取得関連の設定 ---
        events: async function(fetchInfo, successCallback, failureCallback) {
            try {
                // 【重要】ここにあなたのGASのウェブアプリURLを貼り付けてください
                const GAS_URL = 'https://script.google.com/macros/s/AKfycbwCfcnmvNtqKOGSNLqv7EcUq3A0wXcaeHJhgGT17vJX6y3jNBhk9zPcS84bTP4LbA7Gsw/exec'; // ← 必ず書き換える！
                
                const response = await fetch(GAS_URL);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();

                if (data.error) {
                    throw new Error(`GAS Error: ${data.error}`);
                }

                // NotionのデータをFullCalendarの形式に変換
                const events = data.results.map(page => {
                    // ※※※ ここのプロパティ名はあなたのNotionデータベースに合わせて変更してください ※※※
                    const title = page.properties.タイトル?.title[0]?.plain_text || '（無題）';
                    const dateInfo = page.properties.実行日?.date;

                    if (!dateInfo || !dateInfo.start) return null;

                    return {
                        title: title,
                        start: dateInfo.start,
                        end: dateInfo.end, // 終了日があれば設定
                        allDay: !dateInfo.start.includes('T'), // 'T'が含まれていなければ終日イベントと判断
                    };
                }).filter(event => event !== null); // nullを除外

                successCallback(events);
            } catch (error) {
                console.error('カレンダーデータの取得に失敗しました:', error);
                // ユーザーの操作を妨げるalertを削除し、コンソールエラーのみにする
                failureCallback(error);
            }
        }
    });

    // カレンダーを描画
    calendar.render();
});

