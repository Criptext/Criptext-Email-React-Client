import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { reloadWindow, mySettings } from '../utils/electronInterface';
import './mainerrorboundary.scss';
import string from './../lang';

const { crash } = string;

const HighOrderBoundarie = AppComponent =>
  class ErrorBoundaries extends Component {
    state = {
      hasError: false,
      errorTitle: '',
      errorInfo: '',
      counter: 200
    };

    componentDidCatch(error, info) {
      const errorInfo = info.componentStack;
      this.setState(
        {
          hasError: true,
          errorTitle: error,
          errorInfo
        },
        this.updateCounter
      );
    }

    render() {
      if (this.state.hasError) {
        return (
          <div data-theme={mySettings.theme || 'light'}>
            <div id="error-boundary-container">
              <div className="error-boundary-content">
                <div className="error-boundary-logo" />

                <div className="error-boundary-text">
                  <h1>{crash.title}</h1>
                  <h2>
                    {`${crash.counter.a} ${this.state.counter} ${
                      crash.counter.b
                    }`}
                  </h2>
                </div>

                <div className="error-boundary-options">
                  <button
                    className="button button-a"
                    onClick={() => this.restartApp()}
                  >
                    {crash.buttons.restart_now}
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      }
      return <AppComponent />;
    }

    componentWillUnmount() {
      clearTimeout(this.counterTimeout);
    }

    updateCounter = () => {
      if (this.state.counter <= 1) {
        clearTimeout(this.counterTimeout);
        this.restartApp();
        return;
      }
      this.setState(
        prevState => ({
          counter: prevState.counter - 1
        }),
        () => {
          this.counterTimeout = setTimeout(this.updateCounter, 1000);
        }
      );
    };

    restartApp = () => reloadWindow();
  };

HighOrderBoundarie.propTypes = {
  error: PropTypes.object,
  info: PropTypes.string
};

export default HighOrderBoundarie;
