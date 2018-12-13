import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ManualSyncPopup from './ManualSyncPopup';

class ManualSyncPopupWrapper extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <ManualSyncPopup
        onClickCancelManualSync={this.handleClickCancelManualSync}
        onClickConfirmManualSync={this.handleClickConfirmManualSync}
      />
    );
  }

  handleClickCancelManualSync = () => {
    this.props.onHideSettingsPopup();
  };

  handleClickConfirmManualSync = async () => {
    await this.props.onHideSettingsPopup();
  };
}

ManualSyncPopupWrapper.propTypes = {
  onHideSettingsPopup: PropTypes.func
};

export default ManualSyncPopupWrapper;
