import moment from 'moment';
import { mySettings } from './electronInterface';
import string from './../lang';

const language = mySettings.language;
const { momentLocales, mailbox } = string;

moment.locale(language, {
  months: momentLocales.months.split('_'),
  monthsShort: momentLocales.monthsShort.split('_'),
  monthsParseExact: true,
  weekdays: momentLocales.weekdays.split('_'),
  weekdaysShort: momentLocales.weekdaysShort.split('_'),
  weekdaysMin: momentLocales.weekdaysMin.split('_'),
  weekdaysParseExact: true,
  relativeTime: momentLocales.relativeTime
});

const getTimeLocal = time => {
  const timeUTC = moment.utc(time);
  return moment(timeUTC).local();
};

const getDiffDays = time => {
  const todayStartTime = moment().endOf('day');
  const timeStartLocal = getTimeLocal(time).endOf('day');
  return todayStartTime.diff(moment(timeStartLocal), 'days');
};

export const defineTimeByToday = time => {
  console.log("TIME: " + time);
  const timeLocal = getTimeLocal(time);
  const diffDays = getDiffDays(time);

  if (diffDays < 1) {
    return moment(timeLocal).format('h:mm A');
  } else if (diffDays < 2) {
    return moment(timeLocal).format(`[${momentLocales.yesterdayText}]`);
  } else if (diffDays < 7) {
    return moment(timeLocal).format('dddd');
  }
  return moment(timeLocal).format('MMM DD');
};

export const defineLargeTime = time => {
  return moment(getTimeLocal(time)).format(
    `ddd, D MMM YYYY [${momentLocales.atText}] h:mm A`
  );
};

export const defineLastDeviceActivity = time => {
  return moment(getTimeLocal(time)).fromNow();
};

export const parseRateLimitBlockingTime = secondsString => {
  let seconds = Number(String(secondsString));
  const hours = Math.floor(seconds / 3600);
  seconds %= 3600;
  const minutes = Math.floor(seconds / 60);
  return (
    `${hours ? String(hours) + 'h ' : ''}` +
    `${minutes ? String(minutes) + 'min' : ''}`
  );
};

export const defineUnsentText = time => {
  const timeLocal = getTimeLocal(time);
  const diffDays = getDiffDays(time);
  const { atText, yesterdayText } = momentLocales;
  const prefix = mailbox.unsentText;
  const suffix = `[${atText}] h:mm A`;

  if (diffDays < 1) {
    return moment(timeLocal).format(`[${prefix}] ${suffix}`);
  } else if (diffDays < 2) {
    const text = `[${prefix} ${yesterdayText}] ${suffix}`;
    return moment(timeLocal).format(text);
  } else if (diffDays < 7) {
    return moment(timeLocal).format(`[${prefix}] dddd ${suffix}`);
  }
  return moment(timeLocal).format(`DD MMM YYYY ${suffix}`);
};

export const formatLastBackupDate = time => {
  return moment(time).format(`MMM D, YYYY [${momentLocales.atText}] h:mm A`);
};

export const defineBackupFileName = extension => {
  return moment(getTimeLocal(Date.now())).format(
    `[Backup]-YYYY-MM-D_HH-mm.[${extension}]`
  );
};

export const getAutoBackupDates = (time, period, unit) => {
  const nowDate = moment(time);
  const nextDate = moment(time).add(period, unit);
  return {
    nowDate: nowDate.format('YYYY-MM-DD HH:mm:ss'),
    nextDate: nextDate.format('YYYY-MM-DD HH:mm:ss')
  };
};
