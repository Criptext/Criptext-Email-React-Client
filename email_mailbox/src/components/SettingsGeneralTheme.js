import React from 'react';
import PropTypes from 'prop-types';
import string from '../lang';

const SettingsGeneralTheme = props => (
  <div className="section-block">
    <div className="section-block-title">
      <h1>{string.settings.theme}</h1>
    </div>
    <div className="section-block-content">
      <div className="section-block-content-item">
        <select onChange={props.onChangeSelectTheme} value={props.theme}>
          {props.themes.map((themeItem, index) => {
            return (
              <option key={index} value={themeItem.value}>
                {themeItem.text}
              </option>
            );
          })}
        </select>
      </div>
    </div>
  </div>
);

SettingsGeneralTheme.propTypes = {
  theme: PropTypes.string,
  themes: PropTypes.array,
  onChangeSelectTheme: PropTypes.func
};

export default SettingsGeneralTheme;
