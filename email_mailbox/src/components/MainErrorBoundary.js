import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './mainerrorboundary.scss';
import { reloadWindow } from '../utils/electronInterface';

const logErrorToMyService = (err, info) => {
  console.log(`
    Error:${err} \n
    Info: ${JSON.stringify(info)}
  `);
};

class MainErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      errorTitle: '',
      errorInfo: ''
    };
  }

  componentDidCatch(error, info) {
    const firstErrorLine = info.componentStack
      .split('\n')
      .slice(0,3)
      .join('\n');
    this.setState({
      hasError: true,
      errorTitle: error,
      errorInfo: firstErrorLine
    });
    logErrorToMyService(error, info);
  }

  render() {
    return this.state.hasError 
      ? this.renderAppError()
      : this.props.children;
  }

  renderAppError = () => (
    <div id="error-boundary-container">
      <div className="error-boundary-title">
        <h1>Oops! Something went wrong :(</h1>
      </div>
      <hr />

      <div className="error-boundary-content">
        <pre>
          {`${this.state.errorTitle}\n ${this.state.errorInfo}`}
        </pre>

        <p>Do not worry. Just choose an action:</p>
        <div className="error-boundary-options">
          <button className="button button-a" onClick={this.handleClickRestartApp}>
            Restart app
          </button>
          <button className="button button-a" onClick={this.handleClickNotifyError}>
            Notify error
          </button>
        </div>
      </div>
    </div>
  );

  handleClickRestartApp = () => {
    reloadWindow();
  };

  handleClickNotifyError = () => {
    const message = this.state.errorTitle + ': ' + this.state.errorInfo;
    alert(message);
    setTimeout(this.handleClickRestartApp, 3000);
  };
}

MainErrorBoundary.propTypes = {
  children: PropTypes.object
};

export default MainErrorBoundary;