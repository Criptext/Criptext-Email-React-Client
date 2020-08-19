import React, { Component } from 'react';
import PropTypes from 'prop-types';
import SetupCover from './SetupCover';
import string from '../../lang';
import './themewrapper.scss';

const { theme } = string.setup;

class ThemeWrapper extends Component {
  constructor(props) {
    super(props);
    this.state = {
      theme: false
    };
  }

  render() {
    return (
      <SetupCover
        {...this.props}
        title={theme.title}
        topButton={theme.button}
        onClickTopButton={this.handleNext}
        theme={this.state.theme ? 'theme-dark' : 'theme-light'}
      >
        <div
          className={`setup-theme ${
            this.state.theme ? 'theme-dark' : 'theme-light'
          }`}
        >
          <div className="theme-tip">{theme.tip}</div>
          <div className="theme-selector">
            <div
              className="theme-slider"
              style={{
                right: this.state.theme ? '42px' : '156px'
              }}
              onClick={this.handleToggleTheme}
            >
              {this.state.theme ? theme.dark : theme.light}
            </div>
            <span>{theme.light}</span>
            <span>{theme.dark}</span>
          </div>
        </div>
      </SetupCover>
    );
  }

  handleNext = () => {
    this.props.onGoTo('verify');
  };

  handleToggleTheme = () => {
    this.setState(
      {
        theme: !this.state.theme
      },
      () => {
        window.swapTheme(this.state.theme ? 'dark' : 'light');
      }
    );
  };
}

ThemeWrapper.propTypes = {
  step: PropTypes.string
};
export default ThemeWrapper;
