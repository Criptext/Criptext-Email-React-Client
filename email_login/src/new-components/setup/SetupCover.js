import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Button, { STYLE } from '../templates/Button';
import string from '../../lang';

import './setup.scss';

const SetupCover = ({
  children,
  step,
  totalSteps,
  title,
  topButton,
  bottomButton,
  onClickTopButton,
  onClickBotButton,
  topButtonDisabled
}) => (
  <div className="setup-wrapper">
    {totalSteps && (<div className="steps-guide">
      {string.formatString(
        string.setup.step,
        step,
        totalSteps
      )}
    </div>)}
    <div className="setup-title">{title}</div>
    <div className="step-container">{children}</div>
    <div>
      <Button
        style={STYLE.CRIPTEXT}
        text={topButton}
        onClick={onClickTopButton}
        disabled={topButtonDisabled || false}
      />
      {bottomButton && (
        <Button
          style={STYLE.TEXT}
          text={bottomButton}
          onClick={onClickBotButton}
        />
      )}
    </div>
  </div>
);

export default SetupCover;
