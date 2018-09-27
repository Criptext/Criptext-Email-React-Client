import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Body from './Body';

class BodyWrapper extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isToolbarHidden: true
    };
  }

  render() {
    return (
      <Body
        {...this.props}
        getHtmlBody={this.props.getHtmlBody}
        htmlBody={this.props.htmlBody}
        isFocusEditorInput={this.props.isFocusEditorInput}
        isToolbarHidden={this.state.isToolbarHidden}
        onClickTextEditor={this.handleTextEditor}
        onDrop={this.props.onDrop}
        onFocusTextEditor={this.props.onFocusTextEditor}
      />
    );
  }

  handleTextEditor = () => {
    this.setState({ isToolbarHidden: !this.state.isToolbarHidden });
  };
}

BodyWrapper.propTypes = {
  getHtmlBody: PropTypes.func,
  htmlBody: PropTypes.object,
  isFocusEditorInput: PropTypes.bool,
  onDrop: PropTypes.func,
  onFocusTextEditor: PropTypes.func
};

export default BodyWrapper;
