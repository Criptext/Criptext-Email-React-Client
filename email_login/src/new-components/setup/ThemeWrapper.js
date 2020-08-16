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
      >
        <div className="setup-theme">
          <div className="theme-tip">
            {theme.tip}
          </div>
          <div className="theme-selector">
            <div className="theme-slider">{theme.light}</div>
            <span>{theme.dark}</span>
          </div>
        </div>
      </SetupCover>
    );
  }

  handleNext = () => {
    this.props.onGoTo('verify');
  };
}

ThemeWrapper.propTypes = {
  step: PropTypes.string
};
export default ThemeWrapper;
