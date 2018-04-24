import React from 'react';
import PropTypes from 'prop-types';
import HeaderThreadOptionsWrapper from './HeaderThreadOptionsWrapper';
import ActivityPanelShortCut from './ActivityPanelShortCut';
import './threadheader.css';

const ThreadHeader = props => (
  <header className="thread-header">
    <div className="header-container">
      <HeaderThreadOptionsWrapper {...props} />
    </div>
    <ActivityPanelShortCut onClick={props.onToggleActivityPanel} />
  </header>
);

ThreadHeader.propTypes = {
  onToggleActivityPanel: PropTypes.func
};

export default ThreadHeader;
