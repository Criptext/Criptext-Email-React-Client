import React from 'react';
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
        <p>{props.paragraph}</p>
      </div>
    </div>
  );
};

export default MigrationPopup;
