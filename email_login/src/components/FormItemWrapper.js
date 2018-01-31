import React, { Component } from 'react';
import FormItem from './FormItem';

class FormItemWrapper extends Component {
  constructor(props) {
    super(props);
    this.state = {
      validated: false,
      hasError: false,
      isChecked: false
    };
    this.onCheck = this.onCheck.bind(this);
  }

  onValidate() {
    this.setState({
      validated: true
    });
  }

  onHasError() {
    this.setState({
      hasError: true
    });
  }

  onCleanError() {
    this.setState({
      hasError: false
    });
  }

  onCheck() {
    this.setState({
      isChecked: !this.state.isChecked
    });
  }

  render() {
    return (
      <FormItem
        {...this.props}
        validated={this.state.validated}
        hasError={this.state.hasError}
        isChecked={this.state.isChecked}
        onValidate={this.onValidate}
        onHasError={this.onHasError}
        onCleanError={this.onCleanError}
        onCheck={this.onCheck}
      />
    );
  }
}

export default FormItemWrapper;
