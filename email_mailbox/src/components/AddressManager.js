import React, { Component } from 'react';
import { myAccount, mySettings } from '../utils/electronInterface';
import string from './../lang';
import { accountUrl } from '../utils/const';
import './addressmanager.scss';
const localize = string.settings.address_manager;

const Loading = () => (
  <div className="loading-ring">
    <div />
    <div />
    <div />
    <div />
  </div>
);

class AddressManager extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true
    };
  }

  render() {
    return (
      <div className="settings-content">
        <div className="settings-address-manager-header">
          {localize.subtitle}
        </div>
        <div className="cptx-address-manager cptx-scrollbar">
          {this.state.loading && (
            <div className="cptx-address-manager-loader">
              <Loading />
            </div>
          )}
          <iframe
            id="cptx-address-manager-iframe"
            title="cptx-address-manager-iframe"
            src={`${accountUrl}/?#/addresses?lang=${mySettings.language ||
              'en'}&token=${myAccount.jwt}`}
            onLoad={this.handleLoad}
            className={
              this.state.loading
                ? 'cptx-address-manager-invisible'
                : 'cptx-address-manager-visible'
            }
          />
        </div>
      </div>
    );
  }

  handleLoad = () => {
    this.setState({ loading: false });
  };
}

export default AddressManager;
