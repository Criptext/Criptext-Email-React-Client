import React, { Component } from 'react';
import SettingsGeneralTheme from './SettingsGeneralTheme';
import {
  reloadWindow,
  mySettings,
  updateAppSettings
} from '../utils/electronInterface';
import string from './../lang';

const { themeLabels } = string.settings;

const themes = [
  { text: themeLabels.light, value: 'light' },
  { text: themeLabels.dark, value: 'dark' }
];

class SettingsGeneralThemeWrapper extends Component {
  constructor(props) {
    super(props);
    this.state = {
      theme: mySettings.theme
    };
  }

  render() {
    return (
      <SettingsGeneralTheme
        theme={this.state.theme}
        themes={themes}
        onChangeSelectTheme={this.handleChangeSelectTheme}
      />
    );
  }

  handleChangeSelectTheme = async e => {
    const theme = e.target.value;
    this.setState({ theme });
    await updateAppSettings({ theme });
    reloadWindow();
  };
}

export default SettingsGeneralThemeWrapper;
