import React from 'react';
import PropTypes from 'prop-types';
import string from './../lang';

const SettingsGeneralLanguage = props => (
  <div className="section-block">
    <div className="section-block-title">
      <h1>{string.settings.language}</h1>
    </div>
    <div className="section-block-content">
      <div className="section-block-content-item">
        <select
          onChange={e => props.onChangeSelectLanguage(e)}
          value={props.language}
        >
          {props.languages.map((lang, index) => {
            return (
              <option key={index} value={lang.value}>
                {lang.text}
              </option>
            );
          })}
        </select>
      </div>
    </div>
  </div>
);

SettingsGeneralLanguage.propTypes = {
  language: PropTypes.string,
  languages: PropTypes.array,
  onChangeSelectLanguage: PropTypes.func
};

export default SettingsGeneralLanguage;
