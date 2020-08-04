import React, { Component } from 'react';
import PropTypes from 'prop-types';

import './overlayloader.scss';

const OverlayLoader = () => {
  return (
    <div className="overlay-loader">
      <div className="rectangle-loader-left" />
      <div className="rectangle-loader-right" />
      <div className="loader-message">
        <span>Creating encrypted keys...</span>
      </div>
    </div>
  );
};

export default OverlayLoader;
