import moment from 'moment';

moment.locale('en');

const getTimeLocal = time => {
  const timeUTC = moment.utc(time);
  return moment(timeUTC).local();
};

export const getFormattedDate = date => {
  const timeLocal = getTimeLocal(date);
  const res = moment(timeLocal).format('ddd, D MMM YYYY [at] h:mm A');
  return res;
};
