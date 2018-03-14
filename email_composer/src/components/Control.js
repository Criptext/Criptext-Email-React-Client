import React from 'react';
import PropTypes from 'prop-types';
import './control.css';

const Control = props => (
  <div className="control-container">
    <button
      className={
        'button-a button-send ' +
        (props.status === Status.WAITING ? 'button-send-loading' : '')
      }
      onClick={props.onClickSendMessage}
      disabled={props.status === Status.WAITING || !props.status}
    >
      {props.status === Status.WAITING
        ? renderSendLoadingButton()
        : renderSendNormalButton()}
    </button>
    <div disabled={props.status === Status.WAITING}>
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

const renderSendNormalButton = () => (
  <div>
    <i className="icon-sent" />
    <span>send</span>
  </div>
);

const renderSendLoadingButton = () => (
  <div className="loading">
    <div />
    <div />
    <div />
    <div />
    <div />
    <div />
    <div />
    <div />
  </div>
);

export const Status = {
  ENABLED: 1,
  WAITING: 2
};

Control.propTypes = {
  onClickSendMessage: PropTypes.func,
  onClickTextEditor: PropTypes.func,
  status: PropTypes.number
};

export default Control;
