import React, { Component } from 'react';
import PropTypes from 'prop-types';
import FormItem from './FormItem';

class FormItemWrapper extends Component {
  constructor(props) {
    super(props);
    this.state = {
      validated: false,
      isChecked: false,
      showField: true,
      icon: props.formItem.icon,
      type: props.formItem.type
    };
  }

  onHasError() {
    this.props.onSetError(this.props.formItem.name, true);
  }

  onCleanError() {
    this.props.onSetError(this.props.formItem.name, false);
  }

  onCheck = () => {
    this.setState({
      isChecked: !this.state.isChecked
    });
  };

  onValidate = e => {
    if (e.keyCode === 20 || e.keyCode === 9) return;
    const isOptional = this.props.formItem.optional;
    const optionalDirty = isOptional && e.target.value !== '';
    const optionalClean = isOptional && e.target.value === '';
    if (!isOptional || optionalDirty) {
      const isValid = this.props.validator
        ? this.props.validator(this.props.formItem.name, e.target.value)
        : false;
      this.setState({ validated: true });
      this.props.onSetError(this.props.formItem.name, !isValid);
    }
    if (isOptional && optionalClean) {
      this.setState({ validated: false });
      this.props.onSetError(this.props.formItem.name, false);
    }
  };

  onShowHide = () => {
    this.setState({
      showField: !this.state.showField,
      type: this.state.type === 'text' ? 'password' : 'text',
      icon:
        this.state.icon === this.props.formItem.icon
          ? this.props.formItem.icon2
          : this.props.formItem.icon
    });
  };

  render() {
    return (
      <FormItem
        {...this.props}
        icon={this.state.icon}
        type={this.state.type}
        validated={this.state.validated}
        hasError={this.state.validated && this.props.hasError}
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

// eslint-disable-next-line fp/no-mutation
FormItemWrapper.propTypes = {
  formItem: PropTypes.object,
  hasError: PropTypes.bool,
  validator: PropTypes.func,
  onSetError: PropTypes.func
};

export default FormItemWrapper;
