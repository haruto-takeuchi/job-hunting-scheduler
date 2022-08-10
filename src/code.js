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
  console.log(planInfo.date);
  const calendar = CalendarApp.getCalendarById(calendarId);
  const event = calendar.createEvent(
    planInfo.title,
    new Date(`${planInfo.date}, ${planInfo.startTime}`),
    new Date(`${planInfo.date}, ${planInfo.endTime}`)
  );

  planInfo.location && event.setLocation(planInfo.location);
  planInfo.memo && event.setDescription(planInfo.memo);
}

/**
 *
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
 * nowから２年後までのイベントを取得
 * @returns ２年後までのイベント
 */
function getEnterpriseEvents(calendarId) {
  // const calendarId = "c_jkea33sq3trghie69m0d4k4668@group.calendar.google.com";
  const calendar = CalendarApp.getCalendarById(calendarId);
  const now = new Date();
  const endTime = new Date();
  endTime.setFullYear(now.getFullYear() + 2); // 2年後までのイベント取得

  return calendar.getEvents(now, endTime);
}

/**
 * Date型の値をstringにフォーマット
 * @param {Date} date
 * @param {string} format
 * @returns stringにフォーマットされたDate
 */
function formatDateToString(date, format) {
  console.log("date:" + date);
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
  // console.log(`year:${year}`);
  console.log(`month:${date.getMonth()}`);
  // console.log(`day:${day}`);

  switch (format) {
    case "YYYY-MM-DD":
      return `${year}-${month}-${day}`;

    case "hh:mm":
      return `${hour}:${minute}`;

    default:
      return `${year}-${month}-${day} ${hour}:${minute}`;
  }
}

function getEventList(calendarId) {
  const events = getEnterpriseEvents(calendarId);
  const eventsInfo = [];

  events.map((event) => {
    console.log(event.getStartTime());
    eventsInfo.push({
      id: event.getId(),
      title: event.getTitle(),
      date: formatDateToString(event.getStartTime(), "YYYY-MM-DD"), //event.getStartTime()
      startTime: formatDateToString(event.getStartTime(), "hh:mm"),
      endTime: formatDateToString(event.getEndTime(), "hh:mm"),
      location: event.getLocation(),
      memo: event.getDescription(),
    });
  });
  return eventsInfo;
}

function getSameCalendar(calendarId) {
  const calendar = CalendarApp.getCalendarById(calendarId);
  return calendar.getName();
}
