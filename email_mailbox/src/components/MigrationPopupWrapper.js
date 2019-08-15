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
import { getGroupEvents } from './../utils/electronEventInterface';
import string from '../lang';

const {
  step1,
  step2,
  step3,
  step4,
  step5
} = string.popups.migration.paragraphs;
const errors = string.popups.migration.errorMessages;

const MIGRATION_STATUS = {
  NOT_STARTED: 'not-started',
  PENDING_EVENTS: 'pending-events',
  NEW_SESSION: 'new-session',
  UPGRADE: 'upgrade',
  SUCCEDED: 'success'
};

const MIGRATION_STATUS_MESSAGES = {
  [MIGRATION_STATUS.NOT_STARTED]: step1,
  [MIGRATION_STATUS.PENDING_EVENTS]: step2,
  [MIGRATION_STATUS.NEW_SESSION]: step3,
  [MIGRATION_STATUS.UPGRADE]: step4,
  [MIGRATION_STATUS.SUCCEDED]: step5
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
    setTimeout(() => {
      this.handleStartMigration();
    }, 1500);
  }

  handleStartMigration = () => {
    this.setState(
      {
        isDisabledConfirmButton: true,
        step: MIGRATION_STATUS.PENDING_EVENTS
      },
      () => {
        this.handlePendingEvents();
      }
    );
  };

  handlePendingEvents = async () => {
    try {
      await getGroupEvents({
        showNotification: false,
        shouldGetMoreEvents: false,
        useLegacy: true
      });
    } catch (ex) {
      return this.setState({
        errorMessage: errors.parseEvents,
        shouldRetry: true,
        shouldRestart: false
      });
    }

    this.setState(
      {
        step: MIGRATION_STATUS.NEW_SESSION
      },
      () => {
        this.migrateAccount();
      }
    );
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
      this.setState({
        errorMessage: errors.keys,
        shouldRetry: false,
        shouldRestart: true
      });
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
      case MIGRATION_STATUS.PENDING_EVENTS: {
        this.handlePendingEvents();
        break;
      }
      case MIGRATION_STATUS.UPGRADE: {
        this.handleUpgradeAccount(retryData);
        break;
      }
      default: {
        break;
      }
    }
  };
}

MigrationPopupWrapper.propTypes = {
  onCloseMailboxPopup: PropTypes.func
};

export default MigrationPopupWrapper;
