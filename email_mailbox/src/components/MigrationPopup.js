import React from 'react';
import PropTypes from 'prop-types';
import string from '../lang';
import './migrationpopup.scss';

const { title, restartApp, retry } = string.popups.migration;

const MigrationPopup = props => {
  return (
    <div id="migration-popup" className="popup-content">
      <div className="popup-title">
        <h1>{title}</h1>
      </div>
      <div className="popup-paragraph">
        {props.showLoading ? (
          <div className="loading-ring">
            <div />
            <div />
            <div />
            <div />
          </div>
        ) : null}
        <p>{props.error || props.paragraph}</p>
      </div>
      {props.shouldRestart ? (
        <div>
          <button className="retry-link" onClick={props.onClickRestart}>
            {restartApp}
          </button>
        </div>
      ) : props.shouldRetry ? (
        <div>
          <button className="retry-link" onClick={props.onClickRetry}>
            {retry}
          </button>
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
  showLoading: PropTypes.bool,
  onClickRestart: PropTypes.func,
  onClickRetry: PropTypes.func
};

export default MigrationPopup;
