import moment from 'moment';

moment.locale('es');

export const defineTimeByToday = time => {
  const oneDay = 86400000;
  const timeUTC = moment.utc(time);
  const timeLocal = moment(timeUTC).local();

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
