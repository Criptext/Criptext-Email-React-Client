import React from 'react';
import PropTypes from 'prop-types';
import './profilepreview.css';

const ProfilePreview = props => (
  <div className="profile-preview">
    <div className="profile-preview-content">
      <div className="icon">
        <span>{props.letters}</span>
      </div>
      <div className="profile-preview-detail">
        <span className="name">{props.name}</span>
        <span className="email-address">{props.emailAddress}</span>
        <button className="button-a">
          <span>My Account</span>
        </button>
      </div>
    </div>
    <div className="profile-preview-controls">
      <button className="button-b">
        <i className="icon-settings" />
        <span>Settings</span>
      </button>
      <button className="button-b">
        <span>Sign Out</span>
      </button>
    </div>
  </div>
);

ProfilePreview.propTypes = {
  letters: PropTypes.string,
  emailAddress: PropTypes.string,
  name: PropTypes.string
};

export default ProfilePreview;
