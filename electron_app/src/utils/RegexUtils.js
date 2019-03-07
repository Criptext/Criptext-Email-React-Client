const emailRegex = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/;
const HTMLTagsRegex = /<[^>]*>?/g;
const mailtoProtocolRegex = /^mailto:/;
const mailformedEventRegex = /(\[|,)null(\]|,)/g;

module.exports = {
  emailRegex,
  HTMLTagsRegex,
  mailtoProtocolRegex,
  mailformedEventRegex
};
