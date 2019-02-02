import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ProfileShortCut from './ProfileShortCut';
import { myAccount } from '../utils/electronInterface';
import { getTwoCapitalLetters } from '../utils/StringUtils';
import { appDomain } from '../utils/const';

class ProfileShortCutWrapper extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isHiddenMenuProfilePreview: true
    };
  }

  render() {
    const letters = getTwoCapitalLetters(myAccount.name);
    return (
      <ProfileShortCut
        avatarUrl={this.props.avatarUrl}
        letters={letters}
        name={myAccount.name}
        emailAddress={`${myAccount.recipientId}@${appDomain}`}
        isHiddenMenuProfilePreview={this.state.isHiddenMenuProfilePreview}
        onClickSettings={this.handleClickSettings}
        onToggleMenuProfilePreview={this.handleToggleMenuProfilePreview}
      />
    );
  }

  handleClickSettings = () => {
    this.setState({
      isHiddenMenuProfilePreview: true
    });
    this.props.onClickSettings();
  };

  handleToggleMenuProfilePreview = () => {
    this.setState({
      isHiddenMenuProfilePreview: !this.state.isHiddenMenuProfilePreview
    });
  };
}

ProfileShortCutWrapper.propTypes = {
  avatarUrl: PropTypes.string,
  onClickSettings: PropTypes.func
};

export default ProfileShortCutWrapper;
