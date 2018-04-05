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
    {!props.isOpenActivityPanel ? (
      <ActivityPanelShortCut onClick={props.onToggleActivityPanel} />
    ) : null}
  </header>
);

ThreadHeader.propTypes = {
  isOpenActivityPanel: PropTypes.bool,
  onToggleActivityPanel: PropTypes.func
};

export default ThreadHeader;
