document.addEventListener('DOMContentLoaded', function() {
    const calendarEl = document.getElementById('calendar');

    // FullCalendarの初期化
    const calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth', // 初期表示は月表示
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek' // 月表示と週表示の切り替えボタン
        },
        events: async function(fetchInfo, successCallback, failureCallback) {
            try {
                // 【重要】ここに先ほどメモしたGASのウェブアプリURLを貼り付ける
                const GAS_URL = 'https://script.google.com/macros/s/AKfycbwCfcnmvNtqKOGSNLqv7EcUq3A0wXcaeHJhgGT17vJX6y3jNBhk9zPcS84bTP4LbA7Gsw/exec';
                
                const response = await fetch(GAS_URL);
                const data = await response.json();

                // NotionのデータをFullCalendarの形式に変換
                const events = data.results.map(page => {
                    // ここはあなたのDBのプロパティ名に合わせて変更が必要
                    const title = page.properties.名前?.title[0]?.plain_text || '無題';
                    const date = page.properties.日付?.date?.start;
                    
                    if (!date) return null; // 日付がないものはスキップ

                    return {
                        title: title,
                        start: date, 
                    };
                }).filter(event => event !== null); // nullを除外

                successCallback(events);
            } catch (error) {
                console.error('データの取得に失敗しました', error);
                failureCallback(error);
            }
        }
    });

    // カレンダーを描画
    calendar.render();
});