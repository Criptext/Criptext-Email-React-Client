/* eslint no-useless-escape: 0 */
export const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
export const HTMLTagsRegex = /<[^>]*>?/g;
export const mimeTypeImageRegex = /image\/([a-z][-+])*/;
export const usernameRegex = /(?=^([a-z0-9]([._-]{0,2}[a-z0-9])+)$)(?:^.{3,16}$)$/;
