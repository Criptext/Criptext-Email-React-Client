import React, { Component } from 'react';
import SettingsGeneralLanguage from './SettingsGeneralLanguage';
import { currentLanguage, languages, setLang } from './../lang';
import { reloadWindow } from './../utils/electronInterface';

class SettingsGeneralLanguageWrapper extends Component {
  constructor(props) {
    super(props);
    this.state = {
      language: currentLanguage
    };
  }

  render() {
    return (
      <SettingsGeneralLanguage
        language={this.state.language}
        languages={languages}
        onChangeSelectLanguage={this.handleChangeSelectLanguage}
      />
    );
  }

  handleChangeSelectLanguage = async e => {
    const language = e.target.value;
    this.setState({ language });
    await setLang(language);
    reloadWindow();
  };
}

export default SettingsGeneralLanguageWrapper;
