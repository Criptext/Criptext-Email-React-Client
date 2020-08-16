import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ReactCodeInput from 'react-verification-code-input';

import './pinsetwrapper.scss';

class PinSetWrapper extends Component {
  constructor(props) {
    super(props);
    this.state = {
      pin: '',
      confirmPin: '',
    };
  }

  render() {
    return (
      <div className='pin-set-container'>
        <h3 className='pin-set-title'>Create your own PIN</h3>
        <div>
          <div>
            <h4>New Pin</h4>
            <ReactCodeInput
              autoFocus={true}
              fieldWidth={32}
              fields={4}
              onChange={this.handleChangePin}
              onComplete={this.handleCompletePin}
              type={'password'}
            />
          </div>
          <div>
            <h4>New Pin</h4>
            <ReactCodeInput
              autoFocus={false}
              fieldWidth={32}
              fields={4}
              onChange={this.handleChangePinConfirm}
              onComplete={this.handleCompletePinConfirm}
              type={'password'}
            />
          </div>
        </div>
      </div>
    )
  }

  handleChangePin = ev => {
    console.log(ev)
  }

  handleChangePinConfirm = ev => {
    console.log(ev)
  }

  handleCompletePin = ev => {
    console.log(ev)
  }

  handleCompletePinConfirm = ev => {
    console.log(ev)
  }
}

PinSetWrapper.propTypes = {
  step: PropTypes.string
};
export default PinSetWrapper;
