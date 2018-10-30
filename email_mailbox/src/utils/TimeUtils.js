const electron = window.require('electron');
const { remote } = electron;
const moment = remote.require('moment');

const oneDay = 86400000;

moment.locale('en');
moment.updateLocale('en', {
  relativeTime: {
    future: 'In %s',
    past: '%s ago',
    s: 'Few seconds',
    ss: '%s seconds',
    m: '1 minute',
    mm: '%d minutes',
    h: 'An hour',
    hh: '%d hours',
    d: 'A day',
    dd: '%d days',
    M: 'A month',
    MM: 'More than 2 months',
    y: 'More than 2 months',
    yy: 'More than 2 months'
  }
});

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
  return moment(getTimeLocal(time)).fromNow();
};
