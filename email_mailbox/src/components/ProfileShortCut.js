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
      avatarUrl={props.avatarUrl}
      emailAddress={props.emailAddress}
      letters={props.letters}
      name={props.name}
      arrowPosition={MenuType.TOP_RIGHT}
      isHidden={props.isHiddenMenuProfilePreview}
      menuPosition={{ top: '48px', right: '-38px' }}
      onClickAddAccount={props.onClickAddAccount}
      onClickSettings={props.onClickSettings}
      onToggleMenu={props.onToggleMenuProfilePreview}
    />
  </div>
);

ProfileShortCut.propTypes = {
  avatarUrl: PropTypes.string,
  emailAddress: PropTypes.string,
  letters: PropTypes.string,
  name: PropTypes.string,
  isHiddenMenuProfilePreview: PropTypes.bool,
  onClickAddAccount: PropTypes.func,
  onClickSettings: PropTypes.func,
  onToggleMenuProfilePreview: PropTypes.func
};

export default ProfileShortCut;
