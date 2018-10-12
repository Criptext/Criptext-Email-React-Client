export const CustomError = params => {
  const customError = new Error();
  return {
    ...customError,
    name: params.name || 'Error',
    message: params.message || params.description || 'Error creating user'
  };
};
