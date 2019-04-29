import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ProfileShortCut from './ProfileShortCut';
import { myAccount } from '../utils/electronInterface';
import {
  compareAccounts,
  defineAccountVisibleParams
} from '../utils/AccountUtils';

class ProfileShortCutWrapper extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loggedAccounts: [myAccount],
      isHiddenMenuProfilePreview: true
    };
  }

  render() {
    const currentAccount = this.state.loggedAccounts[0];
    const { avatarTimestamp } = this.props;
    const { letters, avatarUrl } = defineAccountVisibleParams(
      currentAccount,
      avatarTimestamp
    );
    return (
      <ProfileShortCut
        letters={letters}
        avatarUrl={avatarUrl}
        avatarTimestamp={avatarTimestamp}
        loggedAccounts={this.state.loggedAccounts}
        isHiddenMenuProfilePreview={this.state.isHiddenMenuProfilePreview}
        onClickSettings={this.handleClickSettings}
        onToggleMenuProfilePreview={this.handleToggleMenuProfilePreview}
        onClickAddAccount={this.handleClickAddAccount}
        onClickSelectAccount={this.handleClickSelectAccount}
      />
    );
  }

  async componentDidMount() {
    const loggedAccounts = await this.props.getLoggedAccounts();
    const orderedByStatusAndName = loggedAccounts.sort(compareAccounts);
    this.setState({
      loggedAccounts: orderedByStatusAndName
    });
  }

  handleClickSettings = () => {
    this.setState({
      isHiddenMenuProfilePreview: true
    });
    this.props.onClickSettings();
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

  handleClickSelectAccount = async account => {
    await this.props.onSelectAccount(account);
  };
}

ProfileShortCutWrapper.propTypes = {
  avatarTimestamp: PropTypes.number,
  getLoggedAccounts: PropTypes.func,
  onClickSettings: PropTypes.func,
  onSelectAccount: PropTypes.func,
  openLogin: PropTypes.func
};

export default ProfileShortCutWrapper;
