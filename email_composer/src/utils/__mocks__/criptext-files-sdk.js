export default class FileManager {
  constructor() {
    const Event = {
      FILE_PROGRESS: 'progress',
      FILE_FINISH: 'finish',
      FILE_ERROR: 'error'
    };
    return { Event };
  }
}
