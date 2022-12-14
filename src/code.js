function doGet() {
  return HtmlService.createTemplateFromFile("src/index").evaluate();
}

/**
 * 企業カレンダー作成
 * @param {string} enterpriseName 企業名
 * @param {string} aspiration 志望度
 * @returns カレンダーが作成されたらtrue、されなかったらfalse
 */
function createEnterpriseCalendar(enterpriseName, aspiration) {
  const sameNameCalendar = searchSameNameCalendar(enterpriseName);
  const description = {
    createdBy: "就活スケジュール管理",
    aspiration: `${aspiration}`,
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
 * @returns 同名のカレンダーのID（ない場合はnull）
 */
function searchSameNameCalendar(enterpriseName) {
  const enterpriseCalendars = getEnterpriseCalendars();

  const sameNameCalendar = enterpriseCalendars.find((calendar) => {
    return calendar.getName() == enterpriseName;
  });

  return sameNameCalendar !== undefined ? sameNameCalendar.getId() : null;
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
 * カレンダーの名前とIDを取得
 * @returns カレンダー名とカレンダーIDの配列
 */
function getCalendarNameAndIdList() {
  const calendars = getEnterpriseCalendars();
  const calendarList = [];

  calendars.map((calendar) => {
    calendarList.push({ name: calendar.getName(), id: calendar.getId() });
  });

  return calendarList;
}

/**
 * 引数の志望度と合致するカレンダーを返す
 * @returns カレンダー名とカレンダーIDの配列
 */
function getCalendarListByAspiration(aspiration) {
  const calendars = getEnterpriseCalendars();
  const calendarList = [];

  calendars.map((calendar) => {
    const calendarDescription = calendar.getDescription();
    const description = JSON.parse(calendarDescription);
    if (description.aspiration === aspiration) {
      calendarList.push({ name: calendar.getName(), id: calendar.getId() });
    }
  });

  return calendarList;
}

function getCalendarDescription(calendarId) {
  const calendar = CalendarApp.getCalendarById(calendarId);
  return calendar.getDescription();
}

/**
 * カレンダーIDからカレンダー名を返す
 * @param {string} calendarId
 * @returns カレンダー名
 */
function getSameCalendar(calendarId) {
  const calendar = CalendarApp.getCalendarById(calendarId);
  return calendar.getName();
}

/**
 * カレンダーIDと合致するカレンダー情報をアップデートする
 * @param {string} calendarId
 * @param {string} name
 * @param {string} aspiration
 */
function updateCalendar(calendarId, calendarName, aspiration) {
  const calendar = CalendarApp.getCalendarById(calendarId);
  const sameNameCalendar = searchSameNameCalendar(calendarName);
  const description = {
    createdBy: "就活スケジュール管理",
    aspiration: `${aspiration}`,
  };

  if (!sameNameCalendar) {
    calendar.setName(calendarName).setDescription(JSON.stringify(description));
    return true;
  }
  return false;
}

/**
 * 任意の企業カレンダーを削除する
 * @param {string} calendarId
 * @returns カレンダー削除ができたらTrue
 */
function deleteCalendar(calendarId) {
  try {
    const calendar = CalendarApp.getCalendarById(calendarId);
    calendar.deleteCalendar();
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
}

/**
 * 任意の企業カレンダーにイベントを作成
 * @param {*} calendarId 企業カレンダーのID
 * @param {*} planInfo 予定の情報
 */
function createEnterpriseEvent(calendarId, planInfo) {
  const calendar = CalendarApp.getCalendarById(calendarId);
  const event = calendar.createEvent(
    planInfo.title,
    new Date(`${planInfo.date}  ${planInfo.startTime}`),
    new Date(`${planInfo.date}  ${planInfo.endTime}`)
  );

  planInfo.location && event.setLocation(planInfo.location);
  planInfo.memo && event.setDescription(planInfo.memo);
}

/**
 * nowから２年後までのイベントを取得
 * @returns ２年後までのイベント
 */
function getEnterpriseEvents(calendarId) {
  const calendar = CalendarApp.getCalendarById(calendarId);
  const now = new Date();
  const endTime = new Date();
  endTime.setFullYear(now.getFullYear() + 2); // 2年後までのイベント取得

  return calendar.getEvents(now, endTime);
}

/**
 * 任意のカレンダーからイベント情報を取得して返す
 * @param {string} calendarId
 * @returns イベント情報の配列
 */
function getEventList(calendarId) {
  const events = getEnterpriseEvents(calendarId);
  const eventsInfo = [];

  events.map((event) => {
    eventsInfo.push({
      id: event.getId(),
      title: event.getTitle(),
      date: formatDateToString(event.getStartTime(), "YYYY-MM-DD"),
      startTime: formatDateToString(event.getStartTime(), "hh:mm"),
      endTime: formatDateToString(event.getEndTime(), "hh:mm"),
      location: event.getLocation(),
      memo: event.getDescription(),
    });
  });
  return eventsInfo;
}

/**
 * 企業カレンダーの全てのイベントを取得
 * @returns 企業カレンダーの全イベント
 */
function getAllEventList() {
  const calendarList = getEnterpriseCalendars();
  const eventList = [];

  calendarList.map((calendar) => {
    const events = getEnterpriseEvents(calendar.getId());
    events.map((event) => {
      eventList.push({
        calendarId: calendar.getId(),
        calendarName: calendar.getName(),
        id: event.getId(),
        title: event.getTitle(),
        date: formatDateToString(event.getStartTime(), "YYYY-MM-DD"),
        startTime: formatDateToString(event.getStartTime(), "hh:mm"),
        endTime: formatDateToString(event.getEndTime(), "hh:mm"),
        location: event.getLocation(),
        memo: event.getDescription(),
      });
    });
  });

  // 直近のイベントが始めに来るようにソート
  eventList.sort((first, next) => {
    const firstDate = `${first.date} ${first.startTime}`;
    const nextDate = `${next.date} ${next.startTime}`;

    if (firstDate > nextDate) {
      return 1;
    } else if (firstDate < nextDate) {
      return -1;
    } else {
      return 0;
    }
  });
  return eventList;
}

/**
 * 任意のイベントを更新する
 * @param {string} calendarId
 * @param {string} eventId
 * @param {string} planInfo
 */
function updateEnterpriseEvent(calendarId, eventId, planInfo) {
  const calendar = CalendarApp.getCalendarById(calendarId);
  const event = calendar.getEventById(eventId);
  const startTime = new Date(`${planInfo.date} ${planInfo.startTime}`);
  const endTime = new Date(`${planInfo.date} ${planInfo.endTime}`);

  event.setTitle(planInfo.title);
  event.setTime(startTime, endTime);
  event.setLocation(planInfo.location);
  event.setDescription(planInfo.memo);
}

/**
 * 任意のイベントの削除
 * @param {string} calendarId
 * @param {string} eventId
 */
function deleteEnterpriseEvent(calendarId, eventId) {
  try {
    const calendar = CalendarApp.getCalendarById(calendarId);
    const event = calendar.getEventById(eventId);
    event.deleteEvent();
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
}

/**
 * Date型の値をstringにフォーマット
 * @param {Date} date
 * @param {string} format
 * @returns stringにフォーマットされたDate
 */
function formatDateToString(date, format) {
  let year = date.getFullYear();
  let month = date.getMonth() + 1;
  let day = date.getDate();
  let hour = date.getHours();
  let minute = date.getMinutes();

  // 0埋め
  month = ("0" + month).slice(-2);
  day = ("0" + day).slice(-2);
  hour = ("0" + hour).slice(-2);
  minute = ("0" + minute).slice(-2);

  switch (format) {
    case "YYYY-MM-DD":
      return `${year}-${month}-${day}`;

    case "hh:mm":
      return `${hour}:${minute}`;

    default:
      return `${year}-${month}-${day} ${hour}:${minute}`;
  }
}
