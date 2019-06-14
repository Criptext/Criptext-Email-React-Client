import React from 'react';
import './emailloading.scss';

const EmailLoading = () => (
  <div className="cptx-email-loading-container">
    <div className="cptx-email-loading-info">
      <div className="cptx-email-loading-info-letter" />
      <div className="cptx-email-loading-info-content">
        <div className="cptx-email-loading-text-line" />
        <div className="cptx-email-loading-text-line" />
      </div>
    </div>
    <hr />
    <div className="cptx-email-loading-body">
      <div className="cptx-email-loading-text">
        <div className="cptx-email-loading-text-line" />
        <div className="cptx-email-loading-text-line" />
        <div className="cptx-email-loading-text-line" />
        <div className="cptx-email-loading-text-line" />
      </div>
    </div>
  </div>
);

export default EmailLoading;
