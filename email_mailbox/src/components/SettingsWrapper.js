import React, { Component } from 'react';
import Settings from './Settings';

class SettingsWrapper extends Component {
  constructor(props) {
    super(props);
    this.state = {
      sectionSelected: 'general'
    };
  }

  render() {
    return (
      <Settings
        {...this.props}
        onClickSection={this.handleClickSection}
        sectionSelected={this.state.sectionSelected}
      />
    );
  }

  handleClickSection = section => {
    this.setState({ sectionSelected: section });
  };
}

export default SettingsWrapper;
