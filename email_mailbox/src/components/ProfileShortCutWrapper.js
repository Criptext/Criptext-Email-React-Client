import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ProfileShortCut from './ProfileShortCut';
import { defineAccountVisibleParams } from '../utils/AccountUtils';
import { sendAddedAccountsLimitEvent } from '../utils/electronEventInterface';

class ProfileShortCutWrapper extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isHiddenMenuProfilePreview: true,
      hasUnreadsEmailsOtherAccounts: false
    };
    this.currentAccount = this.props.accounts[0];
    const { letters, avatarUrl } = defineAccountVisibleParams(
      this.currentAccount,
      this.props.avatarTimestamp
    );
    this.letters = letters;
    this.avatarUrl = avatarUrl;
  }

  render() {
    return (
      <ProfileShortCut
        hasUnreadsEmailsOtherAccounts={this.state.hasUnreadsEmailsOtherAccounts}
        letters={this.letters}
        avatarUrl={this.avatarUrl}
        isHiddenMenuProfilePreview={this.state.isHiddenMenuProfilePreview}
        onClickAddAccount={this.handleClickAddAccount}
        onClickItemAccount={this.handleClickItemAccount}
        onClickSettings={this.handleClickSettings}
        onToggleMenuProfilePreview={this.handleToggleMenuProfilePreview}
        {...this.props}
      />
    );
  }

  handleClickSettings = () => {
    this.setState({
      isHiddenMenuProfilePreview: true
    });
    this.props.onClickSettings();
  };

  handleClickAddAccount = () => {
    this.setState(
      {
        isHiddenMenuProfilePreview: true
      },
      () => {
        if (this.props.accountsLimitReached) {
          sendAddedAccountsLimitEvent();
        } else {
          this.props.openLogin({ shouldBeClose: true });
        }
      }
    );
  };

  handleToggleMenuProfilePreview = () => {
    this.setState({
      isHiddenMenuProfilePreview: !this.state.isHiddenMenuProfilePreview
    });
  };

  handleClickItemAccount = async account => {
    await this.props.onUpdateApp(account);
    this.handleToggleMenuProfilePreview();
  };
}

ProfileShortCutWrapper.propTypes = {
  accounts: PropTypes.array,
  accountsLimitReached: PropTypes.bool,
  avatarTimestamp: PropTypes.number,
  onClickSettings: PropTypes.func,
  onUpdateApp: PropTypes.func,
  openLogin: PropTypes.func
};

export default ProfileShortCutWrapper;
