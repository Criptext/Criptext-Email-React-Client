import moment from 'moment';

const oneDay = 86400000;
const language = 'en';

moment.locale(language);

const getTimeLocal = time => {
  const timeUTC = moment.utc(time);
  return moment(timeUTC);
};

const defineYesterdayText = language => {
  switch (language) {
    case 'en':
      return 'Yesterday';
    case 'es':
      return 'Ayer';
    default:
      return 'Yesterday';
  }
};

const yesterdayText = defineYesterdayText(language);

export const defineTimeByToday = time => {
  const timeLocal = getTimeLocal(time);
  const diffTime = moment().diff(moment(timeLocal));
  if (diffTime <= oneDay) {
    return moment(timeLocal).format('h:mm A');
  } else if (diffTime < oneDay * 2) {
    return moment(timeLocal).format(`[${yesterdayText}]`);
  } else if (diffTime < oneDay * 7) {
    return moment(timeLocal).format('dddd');
  }
  return moment(timeLocal).format('MMM DD');
};

export const defineLargeTime = time => {
  return moment(time).format('ddd, D MMM YYYY [at] h:mm A');
};

export const defineLastDeviceActivity = time => {
  return moment(getTimeLocal(time)).fromNow();
};
