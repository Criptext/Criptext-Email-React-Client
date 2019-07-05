import React, { Component } from 'react';
import PropTypes from 'prop-types';
import string from './../lang';
import './subject.scss';

class SubjectWrapper extends Component {
  render() {
    return (
      <div className="subject-container">
        <input
          ref={e => (this.input = e)}
          type="text"
          placeholder={string.subject.placeholder}
          value={this.props.text}
          onChange={this.handleChange}
          onFocus={this.handleFocus}
        />
      </div>
    );
  }

  componentDidMount() {
    setTimeout(() => {
      if (this.props.isFocusSubjectInput) {
        this.input.focus();
      }
    }, 500);
  }

  handleChange = e => {
    this.props.getText(e.target.value);
  };

  handleFocus = () => {
    this.props.onFocusInput(true);
  };
}

SubjectWrapper.propTypes = {
  getText: PropTypes.func,
  isFocusSubjectInput: PropTypes.bool,
  onFocusInput: PropTypes.func,
  text: PropTypes.string
};

export default SubjectWrapper;
