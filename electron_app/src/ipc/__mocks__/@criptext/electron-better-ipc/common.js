const handlers = {};

const answerRenderer = (key, handlerFn) => {
  handlers[key] = handlerFn;
};

const callMain = (key, req) => {
  const handlerFn = handlers[key];
  if (!handlerFn) throw new Error('Unable to find handler for event: ' + key);

  return handlerFn(req);
};

module.exports = {
  answerRenderer,
  callMain
};
