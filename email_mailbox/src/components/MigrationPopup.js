import React from 'react';
import PropTypes from 'prop-types';
import string from '../lang';
import './migrationpopup.scss';

const { title } = string.popups.migration;

const MigrationPopup = props => {
  return (
    <div id="migration-popup" className="popup-content">
      <div className="popup-title">
        <h1>{title}</h1>
      </div>
      <div className="popup-paragraph">
        <div className="loading-ring">
          <div />
          <div />
          <div />
          <div />
        </div>
        <p>{props.error || props.paragraph}</p>
      </div>
      {props.shouldRestart ? (
        <div>
          <button onClick={props.onClickRestart}>Restart</button>
        </div>
      ) : props.shouldRetry ? (
        <div>
          <button onClick={props.onClickRetry}>Retry</button>
        </div>
      ) : null}
    </div>
  );
};

MigrationPopup.propTypes = {
  paragraph: PropTypes.string,
  error: PropTypes.string,
  shouldRestart: PropTypes.bool,
  shouldRetry: PropTypes.bool,
  onClickRestart: PropTypes.func,
  onClickRetry: PropTypes.func
};

export default MigrationPopup;
