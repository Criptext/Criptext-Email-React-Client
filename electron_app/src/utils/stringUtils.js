const removeProtocolFromUrl = (protocol, url) => {
  return url.replace(protocol, '');
};

module.exports = { removeProtocolFromUrl };
