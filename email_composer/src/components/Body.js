import React from 'react';
import PropTypes from 'prop-types';
import DropfileField from './DropfileFieldWrapper';
import Control from './Control';
import './body.css';

const Body = props => (
  <div className="body-container">
    <DropfileField isToolbarHidden={props.isToolbarHidden} />
    <Control onClickTextEditor={props.onClickTextEditor} />
  </div>
);

Body.propTypes = {
  isToolbarHidden: PropTypes.bool,
  onClickTextEditor: PropTypes.func
};

export default Body;
