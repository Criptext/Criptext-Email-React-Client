const isProductionMode = () => {
  return (
    process.env.NODE_ENV !== 'test' && process.env.NODE_ENV !== 'development'
  );
};

const isMacOS = () => {
  return process.platform === 'darwin';
};

module.exports = {
  isProductionMode,
  isMacOS
};
