function doGet() {
  return HtmlService.createTemplateFromFile("src/index").evaluate();
}

/**
 * 企業カレンダー作成
 * @param {string} enterpriseName 企業名
 */
async function createEnterpriseCalendar(enterpriseName) {
  const description = {
    createdBy: "就活スケジュール管理",
    aspiration: "middle",
  };
  const calendar = CalendarApp.createCalendar(enterpriseName);
  calendar.setDescription(JSON.stringify(description));
}
