import moment from 'moment';

export const defineTimeByToday = time => {
  let result;
  moment.locale('es');
  const oneDay = 86400000;
  const timeUTC = moment.utc(time);
  const timeLocal = moment(timeUTC).local();

  const diffTime = moment().diff(moment(timeLocal));
  if (diffTime <= oneDay) {
    result = moment(timeLocal).format('h:mm A');
  } else if (diffTime < oneDay * 2) {
    result = moment(timeLocal).format('[Yesterday]');
  } else if (diffTime < oneDay * 7) {
    result = moment(timeLocal).format('dddd');
  } else {
    result = moment(timeLocal).format('MMM DD');
  }

  return result;
};
