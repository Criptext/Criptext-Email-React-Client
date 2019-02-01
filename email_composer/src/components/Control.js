import React from 'react';
import PropTypes from 'prop-types';
import string from './../lang';
import './control.scss';

const Control = props => (
  <div className="control-container">
    <button
      className={
        'button-a button-send ' +
        (props.status === Status.WAITING ? 'button-send-loading' : '')
      }
      onClick={props.onClickSendMessage}
      disabled={
        props.status === Status.WAITING || props.status === Status.DISABLED
      }
    >
      {props.status === Status.WAITING
        ? renderSendLoadingButton()
        : renderSendNormalButton()}
    </button>
    <div disabled={props.status === Status.WAITING}>
      <div className="buttons-container">
        <div className="button-editor">
          <input
            id="input-attachments"
            type="file"
            className="hide-file-input"
            onChange={props.onDrop}
            multiple={true}
          />
          <label htmlFor="input-attachments">
            <i className="icon-attach" />
          </label>
        </div>
        <div
          className="button-editor button-editor-border-left button-editor-border-right"
          onClick={props.onClickTextEditor}
          onMouseDown={onMouseDown}
        >
          <i className="icon-text-edit" />
        </div>
      </div>
      <div className="buttons-container">
        <div className="button-editor" onClick={props.onClickDiscardDraft}>
          <i className="icon-trash" />
        </div>
      </div>
    </div>
  </div>
);

const onMouseDown = ev => {
  ev = ev || window.event;
  ev.preventDefault();
}

const renderSendNormalButton = () => (
  <div>
    <i className="icon-sent" />
    <span>{string.sendButtonLabel}</span>
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
  DISABLED: 1,
  ENABLED: 2,
  WAITING: 3
};

Control.propTypes = {
  onClickDiscardDraft: PropTypes.func,
  onClickSendMessage: PropTypes.func,
  onClickTextEditor: PropTypes.func,
  status: PropTypes.number,
  onDrop: PropTypes.func
};

export default Control;
