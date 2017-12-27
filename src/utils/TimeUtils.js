import moment from 'moment';

export const defineTimeByToday = time => {
  let result;
  moment.locale('es');
  const oneDay = 86400000;

  const diffTime = moment().diff(moment(time));
  if (diffTime <= oneDay) {
    result = moment(time).format('hh:mm A');
  } else if (diffTime < oneDay * 2) {
    result = moment(time).format('[Ayer]');
  } else if (diffTime < oneDay * 7) {
    result = moment(time).format('dddd');
  } else {
    result = moment(time).format('MMM DD');
  }

  return result;
};
