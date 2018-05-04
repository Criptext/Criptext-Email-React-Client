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
        isToolbarHidden={this.state.isToolbarHidden}
        onClickTextEditor={this.handleTextEditor}
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
  onDrop: PropTypes.func
};

export default BodyWrapper;
