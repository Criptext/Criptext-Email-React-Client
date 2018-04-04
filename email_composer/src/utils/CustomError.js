export class CustomError extends Error {
  constructor(params) {
    const customError = super(params);
    customError.name = params.name || 'Error';
    customError.message =
      params.message || params.description || 'Error sending message';
  }
}
