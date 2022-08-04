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
 * @returns 同名のカレンダー（ない場合はundefined）
 */
function searchSameNameCalendar(enterpriseName) {
  const enterpriseCalendars = getEnterpriseCalendars();

  const sameNameCalendar = enterpriseCalendars.find((calendar) => {
    return calendar.getName() == enterpriseName;
  });

  return sameNameCalendar;
}
