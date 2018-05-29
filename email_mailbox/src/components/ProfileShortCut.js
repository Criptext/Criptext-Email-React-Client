import React from 'react';
import PropTypes from 'prop-types';
import ProfilePreview from './ProfilePreview';
import MenuHOC, { MenuType } from './MenuHOC';
import './profileshortcut.css';

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
      {props.letters}
    </span>
    <MenuProfilePreview
      emailAddress={props.emailAddress}
      letters={props.letters}
      name={props.name}
      arrowPosition={MenuType.TOP_RIGHT}
      isHidden={props.isHiddenMenuProfilePreview}
      menuPosition={{ top: '48px', right: '-38px' }}
      onClickSettings={props.onClickSettings}
      onToggleMenu={props.onToggleMenuProfilePreview}
    />
  </div>
);

ProfileShortCut.propTypes = {
  emailAddress: PropTypes.string,
  letters: PropTypes.string,
  name: PropTypes.string,
  isHiddenMenuProfilePreview: PropTypes.bool,
  onClickSettings: PropTypes.func,
  onToggleMenuProfilePreview: PropTypes.func
};

export default ProfileShortCut;
