function doGet() {
  return HtmlService.createTemplateFromFile("src/index").evaluate();
}

/**
 * 企業カレンダー作成
 * @param {string} enterpriseName 企業名
 * @returns カレンダーが作成されたらtrue、されなかったらfalse
 */
function createEnterpriseCalendar(enterpriseName) {
  const sameNameCalendar = searchSameNameCalendar(enterpriseName);
  const description = {
    createdBy: "就活スケジュール管理",
    aspiration: "middle",
  };

  if (!sameNameCalendar) {
    const calendar = CalendarApp.createCalendar(enterpriseName);
    calendar.setDescription(JSON.stringify(description));
    return true;
  }

  return false;
}

/**
 * 企業カレンダーの取得
 * @returns 企業カレンダー
 */
function getEnterpriseCalendars() {
  const calendars = CalendarApp.getAllOwnedCalendars();
  const enterpriseCalendars = [];

  calendars.map((calendar) => {
    const judgedCalendar = judgeEnterpriseCalendar(calendar);

    if (judgedCalendar) {
      enterpriseCalendars.push(judgedCalendar);
    }
  });

  return enterpriseCalendars;
}

/**
 * カレンダーから企業カレンダーのみを返す
 * @param {Calendar} calendar
 * @returns 企業カレンダー
 */
function judgeEnterpriseCalendar(calendar) {
  const calendarDescription = calendar.getDescription();

  if (!calendarDescription) {
    return;
  }

  const jsonCalendarDescription = JSON.parse(calendarDescription);
  if (jsonCalendarDescription.createdBy !== "就活スケジュール管理") {
    return;
  }

  return calendar;
}

/**
 * 同名のカレンダーを取得し返す
 * @param {string} enterpriseName
 * @returns 同名のカレンダーのID（ない場合はundefined）
 */
function searchSameNameCalendar(enterpriseName) {
  const enterpriseCalendars = getEnterpriseCalendars();

  const sameNameCalendar = enterpriseCalendars.find((calendar) => {
    return calendar.getName() == enterpriseName;
  });

  return sameNameCalendar.getId();
}

/**
 * 企業カレンダーから名前を取得
 * @returns 企業名を配列で返す
 */
function getEnterpriseNameList() {
  const calendars = getEnterpriseCalendars();
  const calendarNameList = [];

  calendars.map((calendar) => {
    calendarNameList.push(calendar.getName());
  });

  return calendarNameList;
}

/**
 * 任意の企業カレンダーに予定を作成
 * @param {*} calendarId 企業カレンダーのID
 * @param {*} planInfo 予定の情報
 */
function createEnterpriseEvent(calendarId, planInfo) {
  const calendar = CalendarApp.getCalendarById(calendarId);
  console.log(calendar);
  console.log(typeof planInfo.date);
  console.log(new Date(`${planInfo.date}, ${planInfo.startTime}`));
  const event = calendar.createEvent(
    planInfo.title,
    new Date(`${planInfo.date}, ${planInfo.startTime}`),
    new Date(`${planInfo.date}, ${planInfo.endTime}`)
  );

  planInfo.location && event.setLocation(planInfo.location);
  planInfo.memo && event.setDescription(planInfo.memo);
}
