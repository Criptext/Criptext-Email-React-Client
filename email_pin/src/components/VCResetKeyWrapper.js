import React, { Component } from 'react';
import ScreenResetKey from './ScreenResetKey';
import { startResetKey } from '../utils/ipc';
import VCHOC from './VCHOC';

const VCResetKey = VCHOC(ScreenResetKey);

class VCResetKeyWrapper extends Component {
  render() {
    return <VCResetKey steps={['default']} />;
  }

  componentDidMount() {
    startResetKey();
  }
}

export default VCResetKeyWrapper;
