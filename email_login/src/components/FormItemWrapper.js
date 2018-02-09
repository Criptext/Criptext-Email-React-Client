import React, { Component } from 'react';
import PropTypes from 'prop-types';
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

  onValidate(e) {
    const isOptional = this.props.formItem.optional;
    const optionalDirty = isOptional && e.target.value !== '';
    const optionalClean = isOptional && e.target.value === '';
    if (!isOptional || optionalDirty) {
      const isValid = this.props.validator ? this.props.validator() : false;
      this.setState({
        validated: true,
        hasError: !isValid
      });
    }
    if (isOptional && optionalClean) {
      this.setState({
        validated: false,
        hasError: false
      });
    }
  }

  onShowHide() {
    this.setState({
      showField: !this.state.showField,
      type: this.state.type === 'text' ? 'password' : 'text',
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

FormItemWrapper.propTypes = {
  formItem: PropTypes.object,
  validator: PropTypes.func
};

export default FormItemWrapper;
