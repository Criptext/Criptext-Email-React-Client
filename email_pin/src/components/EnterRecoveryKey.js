import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Button, { ButtonType } from './Button';
import string from './../lang';
import './enterrecoverykey.scss';

const { page_enter_recovery_key } = string;

class EnterRecoveryKey extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <section>
        <div className="enter-recovery-key-content">
          <h1>{page_enter_recovery_key.title}</h1>
          <p>{page_enter_recovery_key.description}</p>
          <div className="enter-recovery-key">
            <h2>{page_enter_recovery_key.enter_key}</h2>
            <div className="enter-recovery-key-block">
              <div className="icon" />
              <input defaultValue={this.props.pin} type="text" />
            </div>
            <span>
              {page_enter_recovery_key.or}&nbsp;
              <b>{page_enter_recovery_key.upload}</b>&nbsp;
              {page_enter_recovery_key.recovery_file}
            </span>
          </div>
          <Button
            onClick={this.props.onClickSavedIt}
            state={this.props.buttonState}
            text={page_enter_recovery_key.button}
            type={ButtonType.BASIC}
          />
        </div>
      </section>
    );
  }
}

EnterRecoveryKey.propTypes = {
  buttonState: PropTypes.string,
  onClickSavedIt: PropTypes.func,
  pin: PropTypes.string
};

export default EnterRecoveryKey;
