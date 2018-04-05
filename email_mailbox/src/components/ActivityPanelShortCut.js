import React from 'react';
import PropTypes from 'prop-types';
import './activitypanelshortcut.css';

const ActivityPanelShortCut = props => (
  <div
    className="activity-panel-shortcut-container"
    onClick={() => props.onClick()}
  >
    <i className="icon-bell" />
  </div>
);

ActivityPanelShortCut.propTypes = {
  onClick: PropTypes.func
};

export default ActivityPanelShortCut;
