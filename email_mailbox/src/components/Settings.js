import React from 'react';
import PropTypes from 'prop-types';
import SettingAccountWrapper from './SettingAccountWrapper';
import SettingLabelsWrapper from './SettingLabelsWrapper';
import SettingDevicesWrapper from './SettingDevicesWrapper';
import SettingGeneral from './SettingGeneral';
import Message from '../containers/Message';
import { version } from './../../package.json';
import string from '../lang';
import './settings.scss';

const Sections = [
  string.settings.account,
  string.settings.general,
  string.sidebar.labels,
  string.settings.trusted_devices
];

const Settings = props => (
  <div className="settings-container">
    <Message />
    <div className="settings-title">
      <h1>{string.sidebar.settings}</h1>
    </div>
    <div className="settings-content">
      <ul className="settings-content-items">
        {Sections.map((section, index) => (
          <Items
            key={index}
            name={section}
            onClick={props.onClickSection}
            selected={section === props.sectionSelected}
          />
        ))}
      </ul>
      <div className="settings-content-scroll">{renderSection(props)}</div>
      {renderFooter(props)}
    </div>
  </div>
);

const Items = props => (
  <li
    className={'section-item' + (props.selected ? ' selected' : '')}
    onClick={() => props.onClick(props.name)}
  >
    <span>{props.name}</span>
  </li>
);

const renderSection = props => {
  const section = props.sectionSelected;
  switch (section) {
    case Sections[0]:
      return <SettingAccountWrapper {...props} />;
    case Sections[1]:
      return <SettingGeneral {...props} />;
    case Sections[2]:
      return <SettingLabelsWrapper {...props} />;
    case Sections[3]:
      return <SettingDevicesWrapper {...props} />;
    default:
      break;
  }
};

const renderFooter = ({
  isFromStore,
  onClickCheckForUpdates,
  onClickLogout
}) => (
  <div className="settings-footer">
    <div className="settings-footer-version-info">
      <div className="settings-footer-version">
        <span>Criptext Version: {version}</span>
      </div>
      {!isFromStore && (
        <div
          className="settings-footer-check-for-updates"
          onClick={() => onClickCheckForUpdates()}
        >
          <span>{string.settings.check_for_updates}</span>
        </div>
      )}
    </div>
    <div className="settings-footer-logout">
      <hr />
      <div className="logout-label" onClick={() => onClickLogout()}>
        <i className="icon-log-out" />
        <span>{string.settings.logout}</span>
      </div>
    </div>
  </div>
);

Items.propTypes = {
  name: PropTypes.string,
  onClick: PropTypes.func,
  selected: PropTypes.bool
};

Settings.propTypes = {
  onClickSection: PropTypes.func,
  sectionSelected: PropTypes.string
};

renderFooter.propTypes = {
  onClickCheckForUpdates: PropTypes.func,
  onClickLogout: PropTypes.func,
  isFromStore: PropTypes.bool
};

export default Settings;
