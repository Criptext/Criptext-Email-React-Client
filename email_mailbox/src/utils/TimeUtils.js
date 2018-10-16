const electron = window.require('electron');
const { remote } = electron;
const moment = remote.require('moment');

const oneHour = 3600000;
const oneDay = 86400000;

moment.locale('en');

const getTimeLocal = time => {
  const timeUTC = moment.utc(time);
  return moment(timeUTC).local();
};

export const defineTimeByToday = time => {
  const timeLocal = getTimeLocal(time);
  const diffTime = moment().diff(moment(timeLocal));
  if (diffTime <= oneDay) {
    return moment(timeLocal).format('h:mm A');
  } else if (diffTime < oneDay * 2) {
    return moment(timeLocal).format('[Yesterday]');
  } else if (diffTime < oneDay * 7) {
    return moment(timeLocal).format('dddd');
  }
  return moment(timeLocal).format('MMM DD');
};

export const defineLargeTime = time => {
  return moment(time).format('ddd, MMM D, YYYY [at] h:mm A');
};

export const defineLastDeviceActivity = time => {
  const timeLocal = getTimeLocal(time);
  const diffTime = moment().diff(moment(timeLocal));
  if (diffTime < oneHour) {
    return moment(timeLocal).format('mm [minutes ago]');
  } else if (diffTime <= oneDay) {
    return moment(timeLocal).format('h [hours ago]');
  } else if (diffTime < oneDay * 2) {
    return moment(timeLocal).format('[Yesterday]');
  } else if (diffTime < oneDay * 7) {
    return moment(timeLocal).format('dddd');
  }
  return moment(timeLocal).format('MMM DD');
};
