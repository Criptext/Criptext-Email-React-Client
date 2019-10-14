const moment = require('moment');

const DateFormat = 'YYYY-MM-DD HH:mm:ss';

const getTimeLocal = time => {
  const timeUTC = moment.utc(time);
  return moment(timeUTC).local();
};

const defineBackupFileName = extension => {
  return moment(getTimeLocal(Date.now())).format(
    `[Backup]-YYYY-MM-D_HH-mm.[${extension}]`
  );
};

const defineUnitToAppend = frequency => {
  switch (frequency) {
    case 'daily':
      return 'days';
    case 'weekly':
      return 'weeks';
    case 'monthly':
      return 'months';
    default:
      return 'days';
  }
};

const parseDate = date => {
  return moment(date).format(DateFormat);
};

module.exports = {
  backupDateFormat: DateFormat,
  defineBackupFileName,
  defineUnitToAppend,
  parseDate
};
