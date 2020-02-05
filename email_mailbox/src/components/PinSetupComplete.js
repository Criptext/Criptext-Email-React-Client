import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Button, { ButtonTypes } from './Button';
import CustomCheckbox, { CustomCheckboxStatus } from './CustomCheckbox';
import string from './../lang';
import './pinsetupcomplete.scss';

const page_complete = string.popups.security_pin.setup_complete;

class PinSetupComplete extends Component {
  render() {
    return (
      <section>
        <div className="complete-content">
          <div className="complete-animation">
            <div>
              <svg
                viewBox="0 0 19 19"
                className="spark"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M8.296.747c.532-.972 1.393-.973 1.925 0l2.665 4.872 4.876 2.66c.974.532.975 1.393 0 1.926l-4.875 2.666-2.664 4.876c-.53.972-1.39.973-1.924 0l-2.664-4.876L.76 10.206c-.972-.532-.973-1.393 0-1.925l4.872-2.66L8.296.746z" />
              </svg>
              <svg
                viewBox="0 0 19 19"
                className="spark"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M8.296.747c.532-.972 1.393-.973 1.925 0l2.665 4.872 4.876 2.66c.974.532.975 1.393 0 1.926l-4.875 2.666-2.664 4.876c-.53.972-1.39.973-1.924 0l-2.664-4.876L.76 10.206c-.972-.532-.973-1.393 0-1.925l4.872-2.66L8.296.746z" />
              </svg>
              <svg
                viewBox="0 0 19 19"
                className="spark"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M8.296.747c.532-.972 1.393-.973 1.925 0l2.665 4.872 4.876 2.66c.974.532.975 1.393 0 1.926l-4.875 2.666-2.664 4.876c-.53.972-1.39.973-1.924 0l-2.664-4.876L.76 10.206c-.972-.532-.973-1.393 0-1.925l4.872-2.66L8.296.746z" />
              </svg>
              <svg
                viewBox="0 0 19 19"
                className="spark"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M8.296.747c.532-.972 1.393-.973 1.925 0l2.665 4.872 4.876 2.66c.974.532.975 1.393 0 1.926l-4.875 2.666-2.664 4.876c-.53.972-1.39.973-1.924 0l-2.664-4.876L.76 10.206c-.972-.532-.973-1.393 0-1.925l4.872-2.66L8.296.746z" />
              </svg>
              <svg
                viewBox="0 0 19 19"
                className="spark"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M8.296.747c.532-.972 1.393-.973 1.925 0l2.665 4.872 4.876 2.66c.974.532.975 1.393 0 1.926l-4.875 2.666-2.664 4.876c-.53.972-1.39.973-1.924 0l-2.664-4.876L.76 10.206c-.972-.532-.973-1.393 0-1.925l4.872-2.66L8.296.746z" />
              </svg>
              <svg
                viewBox="0 0 19 19"
                className="spark"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M8.296.747c.532-.972 1.393-.973 1.925 0l2.665 4.872 4.876 2.66c.974.532.975 1.393 0 1.926l-4.875 2.666-2.664 4.876c-.53.972-1.39.973-1.924 0l-2.664-4.876L.76 10.206c-.972-.532-.973-1.393 0-1.925l4.872-2.66L8.296.746z" />
              </svg>
              <svg
                className="checkmark-sign"
                viewBox="0 0 48 36"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M47.248 3.9L43.906.667a2.428 2.428 0 0 0-3.344 0l-23.63 23.09-9.554-9.338a2.432 2.432 0 0 0-3.345 0L.692 17.654a2.236 2.236 0 0 0 .002 3.233l14.567 14.175c.926.894 2.42.894 3.342.01L47.248 7.128c.922-.89.922-2.34 0-3.23" />
              </svg>
              <svg
                viewBox="0 0 120 115"
                className="checkmark-background"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M107.332 72.938c-1.798 5.557 4.564 15.334 1.21 19.96-3.387 4.674-14.646 1.605-19.298 5.003-4.61 3.368-5.163 15.074-10.695 16.878-5.344 1.743-12.628-7.35-18.545-7.35-5.922 0-13.206 9.088-18.543 7.345-5.538-1.804-6.09-13.515-10.696-16.877-4.657-3.398-15.91-.334-19.297-5.002-3.356-4.627 3.006-14.404 1.208-19.962C10.93 67.576 0 63.442 0 57.5c0-5.943 10.93-10.076 12.668-15.438 1.798-5.557-4.564-15.334-1.21-19.96 3.387-4.674 14.646-1.605 19.298-5.003C35.366 13.73 35.92 2.025 41.45.22c5.344-1.743 12.628 7.35 18.545 7.35 5.922 0 13.206-9.088 18.543-7.345 5.538 1.804 6.09 13.515 10.696 16.877 4.657 3.398 15.91.334 19.297 5.002 3.356 4.627-3.006 14.404-1.208 19.962C109.07 47.424 120 51.562 120 57.5c0 5.943-10.93 10.076-12.668 15.438z" />
              </svg>
            </div>
          </div>
          <h1>{page_complete.title}</h1>
          {this.props.askKeyChain && (
            <div>
              <div className="complete-checkbox">
                <CustomCheckbox
                  status={CustomCheckboxStatus.fromBoolean(
                    this.props.saveInKeyChain
                  )}
                  onCheck={this.handleCheck}
                />
                <h2>{page_complete.checkbox.title}</h2>
              </div>
              <p>{page_complete.checkbox.description}</p>
            </div>
          )}
          <Button
            onClick={this.onClickCompleteSetup}
            text={page_complete.button}
            type={ButtonTypes.PRIMARY}
          />
        </div>
      </section>
    );
  }

  handleCheck = value => {
    this.props.onChangeSaveInKeyChain(CustomCheckboxStatus.toBoolean(value));
  };

  onClickCompleteSetup = () => {
    this.props.onClickCompleteSetup();
  };
}

PinSetupComplete.propTypes = {
  askKeyChain: PropTypes.bool,
  onClickCompleteSetup: PropTypes.func,
  onChangeSaveInKeyChain: PropTypes.func,
  saveInKeyChain: PropTypes.bool
};

export default PinSetupComplete;
