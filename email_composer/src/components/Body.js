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
    />
    <Control
      onClickTextEditor={props.onClickTextEditor}
      onClickSendMessage={props.onClickSendMessage}
      status={props.status}
    />
  </div>
);

Body.propTypes = {
  blockRenderMap: PropTypes.func,
  getHtmlBody: PropTypes.func,
  htmlBody: PropTypes.object,
  isToolbarHidden: PropTypes.bool,
  onClickSendMessage: PropTypes.func,
  onClickTextEditor: PropTypes.func,
  status: PropTypes.number
};

export default Body;
