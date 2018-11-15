import React from 'react';

const escapeRegExp = str => {
  return str.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
};

export const replaceMatches = (phrase, content) => {
  if (!phrase || !content) {
    return <span>{content}</span>;
  }
  const escapedRegExp = escapeRegExp(phrase);
  const reg = new RegExp(escapedRegExp, 'gi');
  const matches = content.match(reg);
  const splitPhrase = content.split(reg);
  return splitPhrase.reduce((prev, current, i) => {
    prev.push(<span key={i}>{current}</span>);
    if (matches && matches[i]) {
      prev.push(
        <span className="match-string" key={`m${i}`}>
          {matches[i]}
        </span>
      );
    }
    return prev;
  }, []);
};
