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
      'header-profile-shortcut-container' +
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
    {props.badgeAccount && (
      <div className="cptx-header-profile-badge">
        <div />
      </div>
    )}
    <MenuProfilePreview
      accounts={props.accounts}
      avatarTimestamp={props.avatarTimestamp}
      arrowPosition={MenuType.TOP_RIGHT}
      isHidden={props.isHiddenMenuProfilePreview}
      isLoadAppCompleted={props.isLoadAppCompleted}
      menuPosition={{ top: '48px', right: '-38px' }}
      onClickAddAccount={props.onClickAddAccount}
      onClickSettings={props.onClickSettings}
      onToggleMenu={props.onToggleMenuProfilePreview}
      onClickItemAccount={props.onClickItemAccount}
    />
  </div>
);

ProfileShortCut.propTypes = {
  accounts: PropTypes.array,
  avatarTimestamp: PropTypes.number,
  avatarUrl: PropTypes.string,
  badgeAccount: PropTypes.bool,
  isHiddenMenuProfilePreview: PropTypes.bool,
  isLoadAppCompleted: PropTypes.bool,
  letters: PropTypes.string,
  onClickAddAccount: PropTypes.func,
  onClickSettings: PropTypes.func,
  onToggleMenuProfilePreview: PropTypes.func,
  onClickItemAccount: PropTypes.func
};

export default ProfileShortCut;
