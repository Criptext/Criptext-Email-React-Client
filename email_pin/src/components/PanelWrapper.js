import React, { Component } from 'react';
import Panel from './Panel';
import { pinType } from './../utils/electronInterface';

class PanelWrapper extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return <Panel type={pinType} />;
  }
}

export default PanelWrapper;
