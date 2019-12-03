const chunkArray = (array, callback, size = 100) => {
  for (let i = 0; i < array.length; i += size) {
    const chunkedArray = array.slice(i, i + size);
    callback(chunkedArray);
  }
};

module.exports = {
  chunkArray
};
