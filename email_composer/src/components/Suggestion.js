import React from 'react';
import randomcolor from 'randomcolor';
import match from 'autosuggest-highlight/match';
import parse from 'autosuggest-highlight/parse';
import { getTwoCapitalLetters } from './../utils/StringUtils';
import './suggestion.scss';

const Suggestion = (suggestion, { query }) => {
  const { name, email } = suggestion;
  const suggestionText = name ? name : email;
  const letters = getTwoCapitalLetters(suggestionText);
  const color = randomcolor({
    seed: letters,
    luminosity: 'bright'
  });
  const parts = name
    ? getMatchesOnNameAndEmail(name, email, query)
    : getMatchesOnEmail(email, query);

  return (
    <div className="recipient-suggestion">
      {renderCapitalLetters(color, letters)}
      {renderHighlightedText(parts, name)}
      {name ? renderHighlightedRightEmail(parts.email) : null}
    </div>
  );
};

const getMatchesOnNameAndEmail = (name, email, query) => {
  const nameMatches = match(name, query);
  if (!nameMatches.length) {
    const emailMatches = match(email, query);
    return {
      name: [{ highlight: false, text: name }],
      email: parse(email, emailMatches)
    };
  }
  return {
    name: parse(name, nameMatches),
    email: [{ highlight: false, text: email }]
  };
};

const getMatchesOnEmail = (email, query) => {
  const emailMatches = match(email, query);
  const emailParts = parse(email, emailMatches);
  return {
    name: [{ highlight: false, text: '' }],
    email: emailParts
  };
};

const renderCapitalLetters = (color, letters) => (
  <div style={{ background: color }} className="recipient-icon">
    <span className="recipient-icon-letters">{letters}</span>
  </div>
);

const renderHighlightedText = (parts, isName) => (
  <div className="recipient-text">
    <span>
      {!isName && '<'}
      {isName
        ? renderHighlightedLeftName(parts.name)
        : renderHighlightedLeftEmail(parts.email)}
      {!isName && '>'}
    </span>
  </div>
);

const renderHighlightedLeftName = name => {
  return name.map((part, index) => {
    const className = part.highlight ? 'highlight' : null;
    return (
      <span className={className} key={index}>
        {part.text}
      </span>
    );
  });
};

const renderHighlightedLeftEmail = email => {
  return email.map((part, index) => {
    const className = part.highlight ? 'highlight' : null;
    return (
      <span className={className} key={index}>
        {part.text}
      </span>
    );
  });
};

const renderHighlightedRightEmail = email => (
  <div className="sugestion-email-right">
    <span>
      {email.map((part, index) => {
        const className = part.highlight ? 'highlight' : null;
        return (
          <span className={className} key={index}>
            {part.text}
          </span>
        );
      })}
    </span>
  </div>
);

export default Suggestion;
