import React from 'react';

export const replaceMatches = (phrase, content) => {
  if (!phrase) {
    return <span>{content}</span>;
  }
  const reg = new RegExp(phrase, 'gi');
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
