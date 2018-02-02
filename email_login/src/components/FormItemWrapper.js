import React, { Component } from 'react';
import FormItem from './FormItem';

class FormItemWrapper extends Component {
  constructor(props) {
    super(props);
    this.state = {
      validated: false,
      hasError: false,
      isChecked: false,
      showField: true,
      icon: props.formItem.icon,
      type: props.formItem.type
    };
    this.onCheck = this.onCheck.bind(this);
    this.onValidate = this.onValidate.bind(this);
    this.onShowHide = this.onShowHide.bind(this);
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

  onValidate() {
    if ( !this.props.formItem.optional ) {
      const isValid = this.props.validator ? this.props.validator() : false ;
      this.setState({
        validated: true,
        hasError: !isValid
      });
    }
  }

  onShowHide() {
    this.setState({
      showField: !this.state.showField,
    });
    this.setState({
      type: this.state.type === 'text' 
      ? 'password'
      : 'text'
    })
    this.setState({
      icon: this.state.icon === this.props.formItem.icon 
      ? this.props.formItem.icon2
      : this.props.formItem.icon
    });
  }

  render() {
    return (
      <FormItem
        {...this.props}
        icon={this.state.icon}
        type={this.state.type}
        validated={this.state.validated}
        hasError={this.state.hasError}
        isChecked={this.state.isChecked}
        onHasError={this.onHasError}
        onCleanError={this.onCleanError}
        onCheck={this.onCheck}
        onValidate={this.onValidate}
        onShowHide={this.onShowHide}
        showField={this.showField}
      />
    );
  }
}

export default FormItemWrapper;
