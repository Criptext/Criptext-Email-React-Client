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
      {!!props.badge && (
        <div className="activity-panel-shortcut-badge">
          <span>{props.badge}</span>
        </div>
      )}
    </div>
  </div>
);

ActivityPanelShortCut.propTypes = {
  badge: PropTypes.number,
  onClick: PropTypes.func
};

export default ActivityPanelShortCut;
