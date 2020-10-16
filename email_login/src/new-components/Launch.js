import React from 'react';
import PropTypes from 'prop-types';
import Button, { STYLE } from './templates/Button';
import string from '../lang';
import { version } from './../../package.json';
import './launch.scss';

const { launch } = string;

const Launch = props => {
  return (
    <div className="launch-container">
      <div className="title-container">
        <div className="title" />
        <div className="subtitle" />
      </div>
      <div className="buttons-container">
        <Button
          text={launch.login}
          style={STYLE.CRIPTEXT}
          onClick={() => {
            props.onChangeVersion('old');
          }}
        />
        <Button
          text={launch.create}
          onClick={() => {
            props.onGoTo('sign-up');
          }}
          style={STYLE.CLEAR}
        />
      </div>
      <div className="version-container">
        <span>
          {launch.version} {version}
        </span>
      </div>
    </div>
  );
};

Launch.propTypes = {
  onGoTo: PropTypes.func,
  onChangeVersion: PropTypes.func
};

export default Launch;
