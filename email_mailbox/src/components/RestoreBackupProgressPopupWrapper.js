import React, { Component } from 'react';
// import PropTypes from "prop-types";
import RestoreBackupProgressPopup from './RestoreBackupProgressPopup';

class RestoreBackupProgressPopupWrapper extends Component {
  constructor(props) {
    super(props);
    this.state = {
      backupPercent: 0
    };
  }

  render() {
    return (
      <RestoreBackupProgressPopup
        {...this.props}
        backupPercent={this.state.backupPercent}
      />
    );
  }

  componentDidMount() {
    this.incrementPercent();
  }

  incrementPercent = () => {
    if (this.state.backupPercent === 100) {
      return clearTimeout(this.tm);
    }
    this.setState(state => ({
      backupPercent: state.backupPercent + 1
    }));
    this.tm = setTimeout(this.incrementPercent, 600);
  };
}

export default RestoreBackupProgressPopupWrapper;
