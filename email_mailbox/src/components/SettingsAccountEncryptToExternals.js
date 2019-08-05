import React from 'react';
import PropTypes from 'prop-types';
import { Switch } from 'react-switch-input';
import string from '../lang';

const SettingsAccountEncryptToExternals = props => (
  <div id="settings-general-ecrypt-externals" className="cptx-section-item">
    <span className="cptx-section-item-title">
      {string.settings.encrypt_to_externals}
    </span>
    <span className="cptx-section-item-description">
      {string.settings.encrypt_to_externals_description}
    </span>
    <div className="cptx-section-item-control">
      {props.encryptToExternalsisLoading ? (
        <EncryptToExternalsLoadingLabel />
      ) : (
        <Switch
          theme="two"
          name="setEncryptToExternalsSwitch"
          onChange={props.onChangeSwitchEncryptToExternals}
          checked={props.encryptToExternalsEnabled}
          disabled={props.encryptToExternalsisLoading}
        />
      )}
    </div>
  </div>
);

const EncryptToExternalsLoadingLabel = () => (
  <div className="loading-ring">
    <div />
    <div />
    <div />
    <div />
  </div>
);

SettingsAccountEncryptToExternals.propTypes = {
  encryptToExternalsEnabled: PropTypes.bool,
  encryptToExternalsisLoading: PropTypes.bool,
  onChangeSwitchEncryptToExternals: PropTypes.func
};

export default SettingsAccountEncryptToExternals;
