import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ProfileShortCut from './ProfileShortCut';
import { defineAccountVisibleParams } from '../utils/AccountUtils';
import { sendAddedAccountsLimitEvent } from '../utils/electronEventInterface';

class ProfileShortCutWrapper extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isHiddenMenuProfilePreview: true
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
        letters={this.letters}
        avatarUrl={this.avatarUrl}
        avatarTimestamp={this.props.avatarTimestamp}
        loggedAccounts={this.props.accounts}
        isHiddenMenuProfilePreview={this.state.isHiddenMenuProfilePreview}
        onClickSettings={this.handleClickSettings}
        onToggleMenuProfilePreview={this.handleToggleMenuProfilePreview}
        onClickAddAccount={this.handleClickAddAccount}
        onClickItemAccount={this.handleClickItemAccount}
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
    await this.props.onSelectAccount(account);
  };
}

ProfileShortCutWrapper.propTypes = {
  accounts: PropTypes.array,
  accountsLimitReached: PropTypes.bool,
  avatarTimestamp: PropTypes.number,
  onClickSettings: PropTypes.func,
  onSelectAccount: PropTypes.func,
  openLogin: PropTypes.func
};

export default ProfileShortCutWrapper;
