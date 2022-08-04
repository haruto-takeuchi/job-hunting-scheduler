function doGet() {
  return HtmlService.createTemplateFromFile("src/index").evaluate();
}

/**
 * 企業カレンダー作成
 * @param {string} enterpriseName 企業名
 */
function createEnterpriseCalendar(enterpriseName) {
  CalendarApp.createCalendar(enterpriseName, {
    summary: { createdBy: "就活スケジュール管理", aspiration: "middle" },
  });
}
