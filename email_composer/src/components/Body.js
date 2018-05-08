import React from 'react';
import PropTypes from 'prop-types';
import DropfileField from './DropfileField';
import Control from './Control';
import './body.css';

const Body = props => (
  <div className="body-container">
    <DropfileField
      isToolbarHidden={props.isToolbarHidden}
      blockRenderMap={props.blockRenderMap}
      getHtmlBody={props.getHtmlBody}
      htmlBody={props.htmlBody}
      files={props.files}
      isDragActive={props.isDragActive}
      onDragLeave={props.handleDragLeave}
      onDragOver={props.handleDragOver}
      onClearFile={props.onClearFile}
      onDrop={props.onDrop}
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
