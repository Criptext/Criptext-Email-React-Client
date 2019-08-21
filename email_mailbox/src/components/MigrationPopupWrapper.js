import React, { Component } from 'react';
import PropTypes from 'prop-types';
import MigrationPopup from './MigrationPopup';
import {
  getComputerName,
  migrateAlice,
  upgradeAccount,
  logoutApp
} from './../utils/ipc';
import {
  createAccountCredentials,
  generateKeyBundle
} from './../utils/ApiUtils';
import { getDeviceType } from './../utils/electronInterface';
import string from '../lang';

const { step1, step2, step3, step4 } = string.popups.migration.paragraphs;
const errors = string.popups.migration.errorMessages;

const MIGRATION_STATUS = {
  NOT_STARTED: 'not-started',
  NEW_SESSION: 'new-session',
  UPGRADE: 'upgrade',
  SUCCEDED: 'success'
};

const MIGRATION_STATUS_MESSAGES = {
  [MIGRATION_STATUS.NOT_STARTED]: step1,
  [MIGRATION_STATUS.NEW_SESSION]: step2,
  [MIGRATION_STATUS.UPGRADE]: step3,
  [MIGRATION_STATUS.SUCCEDED]: step4
};

class MigrationPopupWrapper extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isDisabledConfirmButton: false,
      errorMessage: null,
      step: MIGRATION_STATUS.NOT_STARTED,
      retryData: null,
      shouldRetry: false,
      shouldRestart: false
    };
  }

  render() {
    return (
      <MigrationPopup
        isDisabledConfirmButton={this.state.isDisabledConfirmButton}
        errorMessage={this.state.errorMessage}
        paragraph={MIGRATION_STATUS_MESSAGES[this.state.step]}
        onClickStartMigration={this.handleClickStartMigration}
        onClickRetry={this.handleRetryUpgrade}
        onClickRestart={logoutApp}
        shouldRetry={this.state.shouldRetry}
        shouldRestart={this.state.shouldRestart}
        {...this.props}
      />
    );
  }

  componentDidMount() {
    setTimeout(this.handleStartMigration, 1500);
  }

  handleStartMigration = () => {
    if (this.state.step === MIGRATION_STATUS.NOT_STARTED) {
      const step = MIGRATION_STATUS.NEW_SESSION;
      this.setState({ step }, this.migrateAccount);
    }
  };

  migrateAccount = async () => {
    const account = await migrateAlice();
    if (!account) {
      this.setState({
        errorMessage: errors.retrieveAccount,
        shouldRetry: false,
        shouldRestart: true
      });
      return;
    }
    try {
      const res = await createAccountCredentials({
        recipientId: account.recipientId,
        deviceId: 0,
        name: account.name
      });
      if (res.status !== 200) {
        this.setState({
          errorMessage: errors.credentials,
          shouldRetry: false,
          shouldRestart: true
        });
        return;
      }
    } catch (ex) {
      // eslint-disable-next-line no-console
      console.log(ex);
      this.setState({
        errorMessage: errors.credentials
      });
      return;
    }

    let keybundle;
    try {
      const keybundleRes = await generateKeyBundle({
        recipientId: account.recipientId,
        deviceId: 0
      });
      if (keybundleRes.status !== 200) {
        this.setState({
          errorMessage: errors.keys,
          shouldRetry: false,
          shouldRestart: true
        });
        return;
      }
      keybundle = await keybundleRes.json();
    } catch (ex) {
      // eslint-disable-next-line no-console
      console.log(ex);
      this.setState({
        errorMessage: errors.keys,
        shouldRetry: false,
        shouldRestart: true
      });
      return;
    }

    const pcName = await getComputerName();
    const deviceType = getDeviceType();
    const keybundleData = {
      deviceName: pcName || window.navigator.platform,
      deviceFriendlyName: pcName || window.navigator.platform,
      deviceType,
      ...keybundle
    };

    this.setState(
      {
        step: MIGRATION_STATUS.UPGRADE,
        retryData: {
          account: {
            recipientId: account.recipientId,
            signature: account.signature,
            signatureEnabled: account.signatureEnabled
          },
          keyBundle: keybundleData
        }
      },
      () => {
        this.handleUpgradeAccount();
      }
    );
  };

  handleUpgradeAccount = async () => {
    const upgradeData = { ...this.state.retryData };
    const success = await upgradeAccount(upgradeData);

    if (!success) {
      this.setState({
        errorMessage: errors.upgrade,
        shouldRetry: true,
        shouldRestart: false
      });
      return;
    }

    this.setState(
      {
        step: MIGRATION_STATUS.SUCCEDED
      },
      () => {
        setTimeout(() => {
          this.props.onCloseMailboxPopup();
        }, 1000);
      }
    );
  };

  handleRetryUpgrade = () => {
    this.setState({
      shouldRetry: null,
      shouldRestart: null
    });
    const retryData = { ...this.state.retryData };

    switch (this.state.step) {
      case MIGRATION_STATUS.UPGRADE: {
        this.handleUpgradeAccount(retryData);
        break;
      }
      default:
        break;
    }
  };
}

MigrationPopupWrapper.propTypes = {
  onCloseMailboxPopup: PropTypes.func
};

export default MigrationPopupWrapper;
