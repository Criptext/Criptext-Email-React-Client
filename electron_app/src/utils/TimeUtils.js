const moment = require('moment');

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

const backupDateFormat = 'YYYY-MM-DD HH:mm:ss';

module.exports = {
  defineBackupFileName,
  defineUnitToAppend,
  backupDateFormat
};
