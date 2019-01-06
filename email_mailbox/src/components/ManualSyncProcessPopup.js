import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ManualSyncDeviceAuthenticationPopup from './ManualSyncDeviceAuthenticationPopup';
import ManualSyncDeviceRejectedPopup from './ManualSyncDeviceRejectedPopup';
import { syncStatus } from '../utils/electronInterface';

const manualSyncStatuses = {
  WAITING: 'waiting',
  REJECTED: 'rejected',
  APPROVED: 'aprroved'
};
const CHECK_STATUS_DELAY = 5000;

class ManualSyncProcessPopup extends Component {
  constructor(props) {
    super(props);
    this.state = {
      mode: manualSyncStatuses.WAITING
    };
  }

  render() {
    switch (this.state.mode) {
      case manualSyncStatuses.WAITING:
        return <ManualSyncDeviceAuthenticationPopup {...this.props} />;
      case manualSyncStatuses.REJECTED:
        return (
          <ManualSyncDeviceRejectedPopup
            onHideSettingsPopup={this.props.onHideSettingsPopup}
          />
        );
      case manualSyncStatuses.APPROVED:
        return null;
      default:
        return null;
    }
  }

  componentDidMount() {
    this.checkManualSyncStatus();
  }

  checkManualSyncStatus = async () => {
    const { status } = await syncStatus();
    if (status === 200) {
      clearTimeout(this.checkManualSyncStatusTimeout);
      this.setState({
        mode: manualSyncStatuses.APPROVED
      });
    } else if (status === 493) {
      clearTimeout(this.checkManualSyncStatusTimeout);
      this.setState({
        mode: manualSyncStatuses.REJECTED
      });
    } else if (status === 491) {
      this.checkManualSyncStatusTimeout = setTimeout(() => {
        this.checkManualSyncStatus();
      }, CHECK_STATUS_DELAY);
    }
  };
}

ManualSyncProcessPopup.propTypes = {
  onHideSettingsPopup: PropTypes.func
};

export { ManualSyncProcessPopup as default, manualSyncStatuses };
