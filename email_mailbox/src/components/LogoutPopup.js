import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './logoutpopup.css';

class ChangePasswordPopup extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isTimerOn: true,
      time: 10
    };
  }

  render() {
    return (
      <div className="logout-popup-content">
        <div className="popup-title">
          <h1>Logout</h1>
        </div>
        <div className="popup-text">
          <span>
            Logging out will delete emails locally from this device. All emails
            will still be available in your other devices.
          </span>
        </div>
        <ChangePasswordPopupButtons
          isTimerOn={this.state.isTimerOn}
          time={this.state.time}
          {...this.props}
        />
      </div>
    );
  }

  componentDidMount() {
    this.startTimer();
  }

  startTimer = () => {
    this.timer = setInterval(() => {
      this.setState({
        time: this.state.time - 1
      });
      if (this.state.time <= 0) {
        this.stopTimer();
      }
    }, 1000);
  };

  stopTimer = () => {
    clearInterval(this.timer);
    this.setState({
      isTimerOn: false
    });
  };
}

const ChangePasswordPopupButtons = props => (
  <div className="popup-buttons">
    <button
      className="button button-a popup-cancel-button"
      onClick={props.onClickCancelLogout}
    >
      Cancel
    </button>
    <button
      className="button button-a popup-confirm-button"
      onClick={props.onConfirmLogout}
      disabled={props.isTimerOn}
    >
      {props.isTimerOn ? `Yes (${props.time})` : `Yes`}
    </button>
  </div>
);

ChangePasswordPopupButtons.propTypes = {
  isTimerOn: PropTypes.bool,
  onConfirmLogout: PropTypes.func,
  onClickCancelLogout: PropTypes.func,
  time: PropTypes.number
};

export default ChangePasswordPopup;
