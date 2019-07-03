import React, { Component } from 'react';
import SettingsGeneralShowEmailPreview from './SettingsGeneralShowEmailPreview';
import {
  getShowEmailPreviewStatus,
  setShowEmailPreviewStatus
} from '../utils/storage';

class SettingsGeneralShowEmailPreviewWrapper extends Component {
  constructor(props) {
    super(props);
    this.state = {
      switchValue: getShowEmailPreviewStatus()
    };
  }

  render() {
    return (
      <SettingsGeneralShowEmailPreview
        switchValue={this.state.switchValue}
        onChangeSwitch={this.handleChangeSwitch}
      />
    );
  }

  handleChangeSwitch = ev => {
    const status = ev.target.checked;
    this.setState(
      {
        switchValue: status
      },
      () => {
        setShowEmailPreviewStatus(status);
      }
    );
  };
}

export default SettingsGeneralShowEmailPreviewWrapper;
