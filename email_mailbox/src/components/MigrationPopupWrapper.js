import React, { Component } from 'react';
import PropTypes from 'prop-types';
import MigrationPopup from './MigrationPopup';
import { getComputerName, migrateAlice, upgradeAccount } from './../utils/ipc';
import { createAccountCredentials, generateKeyBundle } from './../utils/ApiUtils';
import { getDeviceType } from './../utils/electronInterface'
import {
  getGroupEvents
} from './../utils/electronEventInterface';
import string from '../lang';

const { step1, step2, step3, step4 } = string.popups.migration.paragraphs;

const MIGRATION_STATUS = {
  NOT_STARTED: 'not-started',
  PENDING_EVENTS: 'pending-events',
  NEW_SESSION: 'new-session',
  SUCCEDED: 'success'
};

const MIGRATION_STATUS_MESSAGES = {
  [MIGRATION_STATUS.NOT_STARTED]: step1,
  [MIGRATION_STATUS.PENDING_EVENTS]: step2,
  [MIGRATION_STATUS.NEW_SESSION]: step3,
  [MIGRATION_STATUS.SUCCEDED]: step4
};

class MigrationPopupWrapper extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isDisabledConfirmButton: false,
      errorMessage: null,
      step: MIGRATION_STATUS.NOT_STARTED
    };
  }

  render() {
    return (
      <MigrationPopup
        isDisabledConfirmButton={this.state.isDisabledConfirmButton}
        errorMessage={this.state.errorMessage}
        paragraph={MIGRATION_STATUS_MESSAGES[this.state.step]}
        onClickStartMigration={this.handleClickStartMigration}
        {...this.props}
      />
    );
  }

  componentDidMount() {
    setTimeout( () => {
      this.handleStartMigration()
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
      await getGroupEvents({showNotification: false, shouldGetMoreEvents: false, useLegacy: true});
    } catch (ex) {
      console.log(ex);
      return this.setState({
        errorMessage: 'Unable to handle events!'
      })
    }

    this.setState({
      step: MIGRATION_STATUS.NEW_SESSION
    }, () => {
      this.migrateAccount()
    })
  };

  migrateAccount = async () => {
    const account = await migrateAlice();
    const res = await createAccountCredentials({
      recipientId: account.recipientId,
      deviceId: 0,
      name: account.name
    });
    const keybundleRes = await generateKeyBundle({recipientId: account.recipientId, deviceId: 0})
    if (keybundleRes.status !== 200) {
      console.log("GG WP");
    }
    console.log("1")
    const keybundle = await keybundleRes.json();
    const pcName = await getComputerName();
    const deviceType = getDeviceType();
    console.log("2")
    const keybundleData = {
      deviceName: pcName || window.navigator.platform,
      deviceFriendlyName: pcName || window.navigator.platform,
      deviceType,
      ...keybundle
    };
    console.log("3")
    await upgradeAccount({
      account: {
        recipientId: account.recipientId,
        signature: account.signature,
        signatureEnabled: account.signatureEnabled
      }, 
      keyBundle: keybundleData
    });
    this.setState({
      step: MIGRATION_STATUS.SUCCEDED
    }, () => {
      setTimeout( () => {
        this.props.onCloseMailboxPopup()
      }, 1000)
    })
  }

}

MigrationPopupWrapper.propTypes = {
  onCloseMailboxPopup: PropTypes.func
};

export default MigrationPopupWrapper;
