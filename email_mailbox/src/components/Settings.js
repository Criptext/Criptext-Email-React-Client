import React from 'react';
import PropTypes from 'prop-types';
import SettingGeneralWrapper from './SettingGeneralWrapper';
import SettingLabelsWrapper from './SettingLabelsWrapper';
import SettingDevicesWrapper from './SettingDevicesWrapper';
import Message from '../containers/Message';
import { version } from './../../package.json';
import string from '../lang';
import './settings.scss';

const Sections = [
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
      {renderFooter(props.onClickContactSupport)}
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
      return <SettingGeneralWrapper {...props} />;
    case Sections[1]:
      return <SettingLabelsWrapper {...props} />;
    case Sections[2]:
      return <SettingDevicesWrapper {...props} />;
    default:
      break;
  }
};

const renderFooter = onClick => (
  <div className="settings-footer">
    <div className="settings-footer-version">
      <span>
        Criptext&nbsp;
        <b>
          v.
          {version}
        </b>
      </span>
    </div>
    <hr />
    <div className="settings-footer-support" onClick={() => onClick()}>
      <i className="icon-ask" />
      <span>{string.settings.contact_support}</span>
    </div>
  </div>
);

Items.propTypes = {
  name: PropTypes.string,
  onClick: PropTypes.func,
  selected: PropTypes.bool
};

Settings.propTypes = {
  onClickContactSupport: PropTypes.func,
  onClickSection: PropTypes.func,
  sectionSelected: PropTypes.string
};

export default Settings;
