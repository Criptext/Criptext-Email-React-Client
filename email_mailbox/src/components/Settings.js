import React from 'react';
import PropTypes from 'prop-types';
import SettingGeneral from './SettingGeneral';
import SettingLabels from './SettingLabels';
import './settings.css';

const Sections = ['general', 'labels'];

const Settings = props => (
  <div className="settings-container">
    <div className="settings-title">
      <h1>Settings</h1>
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
      {renderSection(props.sectionSelected)}
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

const renderSection = section => {
  switch (section) {
    case 'general':
      return <SettingGeneral />;
    case 'labels':
      return <SettingLabels />;
    default:
      break;
  }
};

Items.propTypes = {
  name: PropTypes.string,
  onClick: PropTypes.func,
  selected: PropTypes.bool
};

Settings.propTypes = {
  onClickSection: PropTypes.func,
  sectionSelected: PropTypes.string
};

export default Settings;
