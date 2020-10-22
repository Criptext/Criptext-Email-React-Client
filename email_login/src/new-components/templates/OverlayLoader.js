import React from 'react';
import string from '../../lang';

import './overlayloader.scss';

const { create } = string.newSignUp;

const OverlayLoader = () => {
  return (
    <div className="overlay-loader">
      <div className="rectangle-loader-left" />
      <div className="rectangle-loader-right" />
      <div className="loader-message">
        <span>{create.creating}</span>
      </div>
    </div>
  );
};

export default OverlayLoader;
