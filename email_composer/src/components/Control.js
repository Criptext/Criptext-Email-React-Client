import React from 'react';
import PropTypes from 'prop-types';
import './control.css';

const Control = props => (
  <div className="control-container">
    <button className="button-a button-send" onClick={props.onClickSendMessage}>
      <i className="icon-sent" />
      <span>send</span>
    </button>
    <div>
      <div className="buttons-container">
        <div className="button-editor">
          <i className="icon-attach" />
        </div>
        <div
          className="button-editor button-editor-border-left button-editor-border-right"
          onClick={props.onClickTextEditor}
        >
          <i className="icon-text-edit" />
        </div>
      </div>
      <div className="buttons-container">
        <div className="button-editor">
          <i className="icon-trash" />
        </div>
      </div>
    </div>
  </div>
);

Control.propTypes = {
  onClickSendMessage: PropTypes.func,
  onClickTextEditor: PropTypes.func
};

export default Control;
