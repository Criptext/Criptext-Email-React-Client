import React, { Component } from 'react';
import Attachment from './Attachment';

class AttachmentWrapper extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: true
    };
  }

  render() {
    return <Attachment {...this.props} isLoading={this.state.isLoading} />;
  }

  componentDidMount() {
    setTimeout(() => {
      this.setState({
        isLoading: false
      });
    }, 3000);
  }
}

export default AttachmentWrapper;
