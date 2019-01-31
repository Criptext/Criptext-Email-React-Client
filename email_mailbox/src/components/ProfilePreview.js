import React from 'react';
import PropTypes from 'prop-types';
import AvatarImage from './AvatarImage';
import string from './../lang';
import './profilepreview.scss';

const ProfilePreview = props => (
  <div className="profile-preview">
    <div className="profile-preview-content">
      <div className="icon">
        <AvatarImage
          letters={props.letters}
          avatarUrl={props.avatarUrl}
        />
      </div>
      <div className="profile-preview-detail">
        <span className="name">{props.name}</span>
        <span className="email-address">{props.emailAddress}</span>
      </div>
    </div>
    <div className="profile-preview-controls">
      <button className="button-b" onClick={() => props.onClickSettings()}>
        <i className="icon-settings" />
        <span>{string.sidebar.settings}</span>
      </button>
    </div>
  </div>
);

ProfilePreview.propTypes = {
  avatarUrl: PropTypes.string,
  letters: PropTypes.string,
  emailAddress: PropTypes.string,
  name: PropTypes.string,
  onClickSettings: PropTypes.func
};

export default ProfilePreview;
