import React from 'react';
import PropTypes from 'prop-types';
import string from './../lang';
import './settingsgenerallanguage.scss';

const SettingsGeneralLanguage = props => (
  <div id="settings-general-language" className="cptx-section-item">
    <span className="cptx-section-item-title">
      {string.settings.language.label}
    </span>
    <span className="cptx-section-item-description">
      {string.settings.language.description}
    </span>
    <div className="cptx-section-item-control">
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
);

SettingsGeneralLanguage.propTypes = {
  language: PropTypes.string,
  languages: PropTypes.array,
  onChangeSelectLanguage: PropTypes.func
};

export default SettingsGeneralLanguage;
