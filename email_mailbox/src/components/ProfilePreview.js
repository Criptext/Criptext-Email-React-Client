import React from 'react';
import PropTypes from 'prop-types';
import AvatarImage from './AvatarImage';
import { defineAccountVisibleParams } from '../utils/AccountUtils';
import string from './../lang';
import './profilepreview.scss';

const ProfilePreview = props => (
  <div id="cptx-profiles-previews">
    <ul className="cptx-profile-preview-accounts">
      {props.accounts.map((account, key) => (
        <ProfileItem
          key={key}
          account={account}
          timestamp={props.avatarTimestamp}
          onClick={props.onClickItemAccount}
        />
      ))}
    </ul>
    <div className="cptx-profile-preview-controls">
      {props.accountsLimitReached ? (
        ''
      ) : (
        <button className="button-b" onClick={() => props.onClickAddAccount()}>
          <i className="icon-plus" />
          <span>{string.header.add_account}</span>
        </button>
      )}
      <button className="button-b" onClick={() => props.onClickSettings()}>
        <i className="icon-settings" />
        <span>{string.sidebar.settings}</span>
      </button>
    </div>
  </div>
);

const ProfileItem = ({ account, timestamp, onClick }) => {
  const {
    name,
    letters,
    emailAddress,
    avatarUrl,
    isActive
  } = defineAccountVisibleParams(account, timestamp);
  const data = { accountId: account.id, recipientId: account.recipientId };
  return (
    <li
      className={`cptx-profile-preview-content ${
        isActive ? 'active' : 'logged'
      }`}
      onClick={isActive ? undefined : () => onClick(data)}
    >
      <div className="cptx-profile-preview-icon">
        <AvatarImage letters={letters} avatarUrl={avatarUrl} />
      </div>
      <div className="cptx-profile-preview-detail">
        <span className="name">{name}</span>
        <span className="email-address">{emailAddress}</span>
      </div>
      {!!account.badge && (
        <div className="cptx-profile-preview-badge">
          <span className="cptx-badge">
            {account.badge > 100 ? '99+' : account.badge}
          </span>
        </div>
      )}
    </li>
  );
};

ProfilePreview.propTypes = {
  avatarTimestamp: PropTypes.number,
  avatarUrl: PropTypes.string,
  accountsLimitReached: PropTypes.bool,
  accounts: PropTypes.array,
  onClickAddAccount: PropTypes.func,
  onClickItemAccount: PropTypes.func,
  onClickSettings: PropTypes.func
};

ProfileItem.propTypes = {
  account: PropTypes.object,
  timestamp: PropTypes.number,
  onClick: PropTypes.func
};

export default ProfilePreview;
