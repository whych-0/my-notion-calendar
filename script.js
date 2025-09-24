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
            day: '日',
            list: 'リスト'
        },
        height: 'auto', // コンテンツの高さに合わせる
        
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
                    const title = page.properties.名前?.title[0]?.plain_text || '（無題）';
                    const dateInfo = page.properties.日付?.date;

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
                failureCallback(error);
                // エラー発生をユーザーに通知することも可能です
                alert('カレンダーのデータの読み込みに失敗しました。');
            }
        }
    });

    // カレンダーを描画
    calendar.render();
});
