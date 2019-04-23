import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Subject from './Subject';

class SubjectWrapper extends Component {
  render() {
    return (
      <Subject
        {...this.props}
        onChangeInput={this.handleChangeInput}
        onFocusInput={this.handleFocusInput}
        text={this.props.text}
      />
    );
  }

  handleChangeInput = e => {
    this.props.getText(e.target.value);
  };

  handleFocusInput = () => {
    this.props.onFocusInput(true);
  };
}

SubjectWrapper.propTypes = {
  getText: PropTypes.func,
  onFocusInput: PropTypes.func,
  text: PropTypes.string
};

export default SubjectWrapper;
