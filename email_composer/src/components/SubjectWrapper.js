import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Subject from './Subject';

class SubjectWrapper extends Component {
  render() {
    return (
      <Subject
        {...this.props}
        getSubject={this.handleGetText}
        onChangeInput={this.handleOnChangeInput}
        text={this.props.text}
      />
    );
  }

  handleOnChangeInput = e => {
    this.props.getText(e.target.value);
  };
}

SubjectWrapper.propTypes = {
  getText: PropTypes.func,
  text: PropTypes.string
};

export default SubjectWrapper;
