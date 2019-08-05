const emailRegex = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/;
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
