import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ProfileShortCut from './ProfileShortCut';
import { myAccount } from '../utils/electronInterface';
import { getTwoCapitalLetters } from '../utils/StringUtils';
import { appDomain, avatarBaseUrl } from '../utils/const';

class ProfileShortCutWrapper extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isHiddenMenuProfilePreview: true
    };
  }

  render() {
    console.log(avatarBaseUrl)
    const letters = getTwoCapitalLetters(myAccount.name);
    const avatarUrl = `${avatarBaseUrl}${myAccount.recipientId}`
    return (
      <ProfileShortCut
        avatarUrl={avatarUrl}
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
  onClickSettings: PropTypes.func
};

export default ProfileShortCutWrapper;
