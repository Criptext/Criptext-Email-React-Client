import moment from 'moment';

const getTimeLocal = time => {
  const timeUTC = moment.utc(time);
  return moment(timeUTC).local();
};

export const parseRateLimitBlockingTime = secondsString => {
  // eslint-disable-next-line fp/no-let
  let seconds = Number(String(secondsString));
  const hours = Math.floor(seconds / 3600);
  seconds %= 3600;
  const minutes = Math.floor(seconds / 60);
  return `${hours ? `${hours}h ` : ''}${minutes ? `${minutes}min` : ''}`;
};

export const defineLastDeviceActivity = time => {
  return moment(getTimeLocal(time)).fromNow();
};

export const getAutoBackupDates = (time, period, unit) => {
  const nowDate = moment(time);
  const nextDate = moment(time).add(period, unit);
  return {
    nowDate: nowDate.format('YYYY-MM-DD HH:mm:ss'),
    nextDate: nextDate.format('YYYY-MM-DD HH:mm:ss')
  };
};