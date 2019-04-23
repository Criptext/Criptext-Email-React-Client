import React from 'react';
import PropTypes from 'prop-types';
import string from '../lang';
import './settingsgeneraltheme.scss';

const SettingsGeneralTheme = props => (
  <div id="settings-general-theme" className="cptx-section-item">
    <span className="cptx-section-item-title">
      {string.settings.theme.label}
    </span>
    <span className="cptx-section-item-description">
      {string.settings.theme.description}
    </span>
    <div className="cptx-section-item-control">
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
);

SettingsGeneralTheme.propTypes = {
  theme: PropTypes.string,
  themes: PropTypes.array,
  onChangeSelectTheme: PropTypes.func
};

export default SettingsGeneralTheme;
