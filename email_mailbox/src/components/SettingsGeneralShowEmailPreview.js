import React from 'react';
import PropTypes from 'prop-types';
import { Switch } from 'react-switch-input';
import string from './../lang';

const SettingsGeneralShowEmailPreview = props => (
  <div id="settings-general-email-preview" className="cptx-section-item">
    <span className="cptx-section-item-title">
      {string.settings.notification_preview.label}
    </span>
    <span className="cptx-section-item-description">
      {string.settings.notification_preview.description}
    </span>
    <div className="cptx-section-item-control">
      <Switch
        theme="two"
        name="setEmailPreviewSwitch"
        onChange={props.onChangeSwitch}
        checked={props.switchValue}
      />
    </div>
  </div>
);

SettingsGeneralShowEmailPreview.propTypes = {
  onChangeSwitch: PropTypes.func,
  switchValue: PropTypes.bool
};

export default SettingsGeneralShowEmailPreview;
