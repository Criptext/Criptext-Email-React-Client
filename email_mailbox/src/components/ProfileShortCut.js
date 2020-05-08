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
    {props.showPlusBorder && (
      <div className="header-profile-plus-border-container">
        <div className="header-profile-plus-inner-border" />
        <div className="header-profile-plus-outer-border" />
      </div>
    )}
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
      accountsLimitReached={props.accountsLimitReached}
      accounts={props.accounts}
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
  badgeAccount: PropTypes.bool,
  letters: PropTypes.string,
  accountsLimitReached: PropTypes.bool,
  accounts: PropTypes.array,
  isHiddenMenuProfilePreview: PropTypes.bool,
  onClickAddAccount: PropTypes.func,
  onClickSettings: PropTypes.func,
  onToggleMenuProfilePreview: PropTypes.func,
  onClickItemAccount: PropTypes.func,
  showPlusBorder: PropTypes.bool
};

export default ProfileShortCut;
