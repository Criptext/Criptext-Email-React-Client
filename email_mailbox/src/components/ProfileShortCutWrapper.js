import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ProfileShortCut from './ProfileShortCut';
import { defineAccountVisibleParams } from '../utils/AccountUtils';
import { myAccount } from '../utils/electronInterface';

class ProfileShortCutWrapper extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isHiddenMenuProfilePreview: true,
      hasUnreadsEmailsOtherAccounts: false
    };
  }

  render() {
    const { letters, avatarUrl } = defineAccountVisibleParams(
      this.props.accounts[0],
      this.props.avatarTimestamp
    );
    const showPlusBorder = myAccount.customerType !== 0;
    return (
      <ProfileShortCut
        avatarUrl={avatarUrl}
        letters={letters}
        hasUnreadsEmailsOtherAccounts={this.state.hasUnreadsEmailsOtherAccounts}
        isHiddenMenuProfilePreview={this.state.isHiddenMenuProfilePreview}
        onClickAddAccount={this.handleClickAddAccount}
        onClickItemAccount={this.handleClickItemAccount}
        onClickSettings={this.handleClickSettings}
        onToggleMenuProfilePreview={this.handleToggleMenuProfilePreview}
        showPlusBorder={showPlusBorder}
        {...this.props}
      />
    );
  }

  handleClickSettings = () => {
    this.setState({
      isHiddenMenuProfilePreview: true
    });
    this.props.openSettings();
  };

  handleClickAddAccount = () => {
    this.setState({
      isHiddenMenuProfilePreview: true
    });
    this.props.openLogin();
  };

  handleToggleMenuProfilePreview = () => {
    this.setState({
      isHiddenMenuProfilePreview: !this.state.isHiddenMenuProfilePreview
    });
  };

  handleClickItemAccount = async account => {
    this.handleToggleMenuProfilePreview();
    await this.props.onUpdateApp(account);
  };
}

ProfileShortCutWrapper.propTypes = {
  accounts: PropTypes.array,
  avatarUrl: PropTypes.string,
  onClickSettings: PropTypes.func,
  avatarTimestamp: PropTypes.number,
  onUpdateApp: PropTypes.func,
  openLogin: PropTypes.func,
  openSettings: PropTypes.func
};

export default ProfileShortCutWrapper;
