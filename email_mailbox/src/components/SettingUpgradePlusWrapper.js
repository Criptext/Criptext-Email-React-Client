import React, { Component } from 'react';
import { myAccount, mySettings } from '../utils/electronInterface';
import './settingupgradepluss.scss';

const Loading = () => (
  <div className="loading-ring">
    <div />
    <div />
    <div />
    <div />
  </div>
);

class SettingUpgradePlusWrapper extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true
    };
  }

  render() {
    return (
      <div className="cptx-update-to-plus">
        {this.state.loading && (
          <div className="cptx-join-plus-loader">
            <Loading />
          </div>
        )}
        <iframe
          id="cptx-upgrade-to-plus-iframe"
          title="cptx-upgrade-to-plus-iframe"
          src={`https://admin.criptext.com/?#/account/billing?token=${
            myAccount.jwt
          }&lang=${mySettings.language || 'en'}`}
          onLoad={this.handleLoad}
          className={
            this.state.loading
              ? 'cptx-join-plus-invisible'
              : 'cptx-join-plus-visible'
          }
        />
      </div>
    );
  }

  handleLoad = () => {
    this.setState({ loading: false });
  };
}

export default SettingUpgradePlusWrapper;
