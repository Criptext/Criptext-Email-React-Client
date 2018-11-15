import React from 'react';
import PropTypes from 'prop-types';
import './activitypanelshortcut.scss';

const ActivityPanelShortCut = props => (
  <div
    className="activity-panel-shortcut-container"
    onClick={() => props.onClick()}
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
