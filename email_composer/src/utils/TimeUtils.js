export const parseRateLimitBlockingTime = secondsString => {
  let seconds = Number(String(secondsString));
  const hours = Math.floor(seconds / 3600);
  seconds %= 3600;
  const minutes = Math.floor(seconds / 60);
  return `${hours ? `${hours}h ` : ''}${minutes ? `${minutes}min` : ''}`;
};
