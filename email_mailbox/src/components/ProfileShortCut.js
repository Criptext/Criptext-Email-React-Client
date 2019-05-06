import React from 'react';
import PropTypes from 'prop-types';
import ProfilePreview from './ProfilePreview';
import AvatarImage from './AvatarImage';
import MenuHOC, { MenuType } from './MenuHOC';
import './profileshortcut.scss';

const MenuProfilePreview = MenuHOC(ProfilePreview);

const ProfileShortCut = props => (
  <div
    className={
      'profile-shortcut-container' +
      (!props.isHiddenMenuProfilePreview ? ' profile-opened' : '')
    }
  >
    <span
      className="header-profile"
      onClick={() => props.onToggleMenuProfilePreview()}
    >
      <AvatarImage
        key={props.avatarUrl}
        avatarUrl={props.avatarUrl}
        letters={props.letters}
      />
    </span>
    <MenuProfilePreview
      loggedAccounts={props.loggedAccounts}
      avatarTimestamp={props.avatarTimestamp}
      arrowPosition={MenuType.TOP_RIGHT}
      isHidden={props.isHiddenMenuProfilePreview}
      menuPosition={{ top: '48px', right: '-38px' }}
      onClickAddAccount={props.onClickAddAccount}
      onClickSettings={props.onClickSettings}
      onToggleMenu={props.onToggleMenuProfilePreview}
      onClickItemAccount={props.onClickItemAccount}
    />
  </div>
);

ProfileShortCut.propTypes = {
  avatarTimestamp: PropTypes.number,
  avatarUrl: PropTypes.string,
  letters: PropTypes.string,
  loggedAccounts: PropTypes.array,
  isHiddenMenuProfilePreview: PropTypes.bool,
  onClickAddAccount: PropTypes.func,
  onClickSettings: PropTypes.func,
  onToggleMenuProfilePreview: PropTypes.func,
  onClickItemAccount: PropTypes.func
};

export default ProfileShortCut;
