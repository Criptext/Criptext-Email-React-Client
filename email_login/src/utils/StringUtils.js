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
    let replacedString = '';
    for (let i = 0; i < string.length; i++) {
      const newCharacter = sanitizedPositions.includes(i)
        ? string.charAt(i)
        : character;
      replacedString += newCharacter;
    }
    return replacedString;
  }
};
