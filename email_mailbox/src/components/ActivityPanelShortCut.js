import React from 'react';
import PropTypes from 'prop-types';
import './activitypanelshortcut.css';

const ActivityPanelShortCut = () => (
  <div
    className="activity-panel-shortcut-container"
    onClick={() => this.props.onClick()}
  >
    <div className="activity-panel-shortcut-content">
      <i className="icon-bell" />
    </div>
  </div>
);

ActivityPanelShortCut.propTypes = {
  onClick: PropTypes.func
};

export default ActivityPanelShortCut;
