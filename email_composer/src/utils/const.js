/*global process */

export const appDomain =
  process.env.NODE_ENV === 'development' ? 'jigl.com' : 'criptext.com';
