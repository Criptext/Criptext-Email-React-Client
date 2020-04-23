import React, { Component } from 'react';
import { myAccount } from '../utils/electronInterface';
import './settingupgradepluss.scss';

class SettingUpgradePlusWrapper extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <div className="cptx-update-to-plus">
        <iframe
          id="cptx-upgrade-to-plus-iframe"
          src={`https://admin.criptext.com/?#/account/billing?token=${
            myAccount.jwt
          }`}
        />
      </div>
    );
  }
}

export default SettingUpgradePlusWrapper;
