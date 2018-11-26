import React from 'react';
import PropTypes from 'prop-types';
import string from './../lang';
import './profilepreview.scss';

const ProfilePreview = props => (
  <div className="profile-preview">
    <div className="profile-preview-content">
      <div className="icon">
        <span>{props.letters}</span>
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
  letters: PropTypes.string,
  emailAddress: PropTypes.string,
  name: PropTypes.string,
  onClickSettings: PropTypes.func
};

export default ProfilePreview;
