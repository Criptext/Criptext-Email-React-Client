import React from 'react';
import randomcolor from 'randomcolor';
import match from 'autosuggest-highlight/match';
import parse from 'autosuggest-highlight/parse';
import { getTwoCapitalLetters } from './../utils/StringUtils';
import './suggestion.css';

const Suggestion = (suggestion, { query }) => {
  const { name, email } = suggestion;
  const suggestionText = name ? name : email;
  const matches = match(suggestionText, query);
  const parts = parse(suggestionText, matches);

  const letters = getTwoCapitalLetters(suggestionText);
  const color = randomcolor({
    seed: letters,
    luminosity: 'bright'
  });

  return (
    <div className="recipient-suggestion">
      {renderCapitalLetters(color, letters)}
      {renderHighlightedText(parts, name)}
      {name ? renderRightEmail(email) : null}
    </div>
  );
};

const renderCapitalLetters = (color, letters) => (
  <span style={{ background: color }} className="badge">
    <span className="badge-text">{letters}</span>
  </span>
);

const renderHighlightedText = (parts, isName) => (
  <span className="highlighted-text">
    {isName ? null : '<'}
    {parts.map((part, index) => {
      const className = part.highlight ? 'highlight' : null;
      return (
        <span className={className} key={index}>
          {part.text}
        </span>
      );
    })}
    {isName ? null : '>'}
  </span>
);

const renderRightEmail = email => (
  <span className="sugestion-email-right">{email}</span>
);

export default Suggestion;
