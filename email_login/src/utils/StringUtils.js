export const censureEmailAddress = address => {
  const [user, domain] = address.split('@');
  const domainLevels = domain.split('.');
  const lastLevel = domainLevels.pop();
  const character = '*';
  const censoredUser = replaceCharacters(user, [0], character);
  const censoredDomain = `${replaceCharacters(
    domainLevels.join('.'),
    [0, -1],
    character
  )}.${lastLevel}`;
  return `${censoredUser}@${censoredDomain}`;
};

export const replaceCharacters = (string, positionsToExclude, character) => {
  if (typeof positionsToExclude === 'string') {
    return positionsToExclude === 'all'
      ? string
      : positionsToExclude === 'none'
        ? character.repeat(string.length)
        : string;
  }
  if (Array.isArray(positionsToExclude)) {
    const sanitizedPositions = positionsToExclude.map(position => {
      return position < 0 ? string.length + position : position;
    });
    // eslint-disable-next-line fp/no-let
    let replacedString = '';
    // eslint-disable-next-line fp/no-let, fp/no-loops, fp/no-mutation
    for (let i = 0; i < string.length; i++) {
      const newCharacter = sanitizedPositions.includes(i)
        ? string.charAt(i)
        : character;
      // eslint-disable-next-line fp/no-mutation
      replacedString += newCharacter;
    }
    return replacedString;
  }
};

export const localize = (string, ...args) => {
  if (args.length <= 0) {
    return string
  }
  return args.reduce((previousValue, argument, index) => {
    return previousValue.replace(`%${index}`, argument)
  }, string) 
}