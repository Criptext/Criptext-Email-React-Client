import React, { Component } from 'react';
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

export default BodyWrapper;
