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
    />
    <Control
      onClickTextEditor={props.onClickTextEditor}
      onClickSendMessage={props.onClickSendMessage}
      disabledSendButton={props.disabledSendButton}
      displayLoadingSendButton={props.displayLoadingSendButton}
    />
  </div>
);

Body.propTypes = {
  getHtmlBody: PropTypes.func,
  disabledSendButton: PropTypes.bool,
  displayLoadingSendButton: PropTypes.bool,
  htmlBody: PropTypes.object,
  isToolbarHidden: PropTypes.bool,
  onClickSendMessage: PropTypes.func,
  onClickTextEditor: PropTypes.func
};

export default Body;
