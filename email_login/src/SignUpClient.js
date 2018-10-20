export const createUser = body =>
  fetch('/user', {
    method: 'POST',
    body
  }).then(res => res.json());
