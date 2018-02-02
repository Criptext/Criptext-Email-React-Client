import React from 'react';
import PropTypes from 'prop-types';
import './control.css';

const Control = props => (
  <div className="control-container">
    <button className="button-a button-send">
      <i className="icon-sent" />
      <span>send</span>
    </button>
    <div>
      <div className="buttons-container">
        <div className="button-editor">
          <i className="icon-attach" />
        </div>
        <div className="button-editor" onClick={props.onClickTextEditor}>
          <i className="icon-attach" />
        </div>
      </div>
    </div>
  </div>
);

Control.propTypes = {
  onClickTextEditor: PropTypes.func
};

export default Control;
