import React from 'react';
import PropTypes from 'prop-types';
import DropfileField from './DropfileFieldWrapper';
import Control from './Control';
import './body.css';

const Body = props => (
  <div className="body-container">
    <DropfileField
      isToolbarHidden={props.isToolbarHidden}
      htmlBody={props.htmlBody}
      getHtmlBody={props.getHtmlBody}
      blockRenderMap={props.blockRenderMap}
      files={props.files}
      onDrop={props.onDrop}
      onClearFile={props.onClearFile}
      handleDragLeave={props.handleDragLeave}
      handleDragOver={props.handleDragOver}
      isDragActive={props.isDragActive}
    />
    <Control
      onClickTextEditor={props.onClickTextEditor}
      onClickSendMessage={props.onClickSendMessage}
      status={props.status}
      onDrop={props.onDrop}
    />
  </div>
);

Body.propTypes = {
  blockRenderMap: PropTypes.object,
  getHtmlBody: PropTypes.func,
  htmlBody: PropTypes.object,
  isToolbarHidden: PropTypes.bool,
  onClickSendMessage: PropTypes.func,
  onClickTextEditor: PropTypes.func,
  status: PropTypes.number,
  files: PropTypes.array,
  onDrop: PropTypes.func,
  onClearFile: PropTypes.func,
  handleDragLeave: PropTypes.func,
  handleDragOver: PropTypes.func,
  isDragActive: PropTypes.bool
};

export default Body;
