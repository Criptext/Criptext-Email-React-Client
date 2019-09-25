/* eslint no-useless-escape: 0 */
const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
const HTMLTagsRegex = /<[^>]*>?/g;
const mailtoProtocolRegex = /^mailto:/;
const mailformedEventRegex = /(\[|,)null(\]|,)/g;
const percentRegex = /\d+(%)/;
const backupFilenameRegex = /Backup-([1-9]\d{3}-(0[1-9]|1[0-2])-([1-9]|[12]\d|3[01]))_(1[0-9]|2[0-3])-([0-9]\d{1}).db/i;

module.exports = {
  emailRegex,
  percentRegex,
  HTMLTagsRegex,
  mailtoProtocolRegex,
  mailformedEventRegex,
  backupFilenameRegex
};
