import React from 'react';
import PropTypes from 'prop-types';
import Button, { ButtonType } from './Button';
import string from './../lang';
import './start.scss';

const { page_start } = string;

const Start = props => (
  <section id="start-containter">
    <div className="start-content">
      <div className="logo" />
      <h1>{page_start.title}</h1>
      <p>{page_start.description}</p>
      <Button
        onClick={props.onClickStart}
        state={props.buttonState}
        text={page_start.button}
        type={ButtonType.BASIC}
      />
    </div>
  </section>
);

Start.propTypes = {
  buttonState: PropTypes.string,
  description: PropTypes.string,
  onClickStart: PropTypes.func
};

export default Start;
