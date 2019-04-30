import React from 'react';
import PropTypes from 'prop-types';
import AvatarImage from './AvatarImage';
import { defineAccountVisibleParams } from '../utils/AccountUtils';
import string from './../lang';
import './profilepreview.scss';

const ProfilePreview = props => (
  <div id="profiles-previews">
    <ul className="cptx-profile-preview-accounts">
      {props.loggedAccounts.map((account, key) => (
        <ProfileItem
          key={key}
          account={account}
          timestamp={props.avatarTimestamp}
          onSelectAccount={props.onSelectAccount}
          onToggleMenu={props.onToggleMenu}
        />
      ))}
    </ul>
    <div className="cptx-profile-preview-controls">
      <button className="button-b" onClick={() => props.onClickAddAccount()}>
        <i className="icon-plus" />
        <span>{string.header.add_account}</span>
      </button>
      <button className="button-b" onClick={() => props.onClickSettings()}>
        <i className="icon-settings" />
        <span>{string.sidebar.settings}</span>
      </button>
    </div>
  </div>
);

const ProfileItem = ({ account, timestamp, onToggleMenu, onSelectAccount }) => {
  const {
    name,
    letters,
    emailAddress,
    avatarUrl,
    isActive
  } = defineAccountVisibleParams(account, timestamp);
  const clickHandler = () =>
    isActive ? onToggleMenu() : onSelectAccount(account);
  return (
    <li
      className={`cptx-profile-preview-content ${
        isActive ? 'active' : 'logged'
      }`}
      onClick={() => clickHandler()}
    >
      <div className="cptx-profile-preview-icon">
        <AvatarImage letters={letters} avatarUrl={avatarUrl} />
      </div>
      <div className="cptx-profile-preview-detail">
        <span className="name">{name}</span>
        <span className="email-address">{emailAddress}</span>
      </div>
    </li>
  );
};

ProfilePreview.propTypes = {
  avatarTimestamp: PropTypes.number,
  avatarUrl: PropTypes.string,
  loggedAccounts: PropTypes.array,
  onClickAddAccount: PropTypes.func,
  onClickSettings: PropTypes.func,
  onSelectAccount: PropTypes.func,
  onToggleMenu: PropTypes.func
};

ProfileItem.propTypes = {
  account: PropTypes.object,
  timestamp: PropTypes.number,
  onToggleMenu: PropTypes.func,
  onSelectAccount: PropTypes.func
};

export default ProfilePreview;
