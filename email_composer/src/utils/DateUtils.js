export const getFormattedDate = date => {
  const [, day, monthName, year] = date.toGMTString().split(' ');
  return {
    monthName,
    day,
    year,
    strTime: formatAMPM(date),
    diff: getUtcTimeDiff(date)
  };
};

const formatAMPM = date => {
  let hours = date.getHours();
  let minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  minutes = minutes < 10 ? '0' + minutes : minutes;
  return hours + ':' + minutes + ' ' + ampm;
};

const getUtcTimeDiff = date => {
  var timezone = date.getTimezoneOffset();
  timezone = timezone / 60 * -1;
  var gmt = '';
  gmt += timezone > 0 ? `+${timezone}:00` : `${timezone}:00`;
  return gmt;
};
