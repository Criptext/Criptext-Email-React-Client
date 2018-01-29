import React, { Component } from 'react';
import CustomCheckbox from './CustomCheckbox';
import PropTypes from 'prop-types';
import './signup.css';

class FormItem extends Component {
  constructor(props) {
    super(props);
    this.state = {
      validated: false,
      hasError: false,
      isChecked: false
    };
  }

  render() {
    return (
      <div className={'form-item ' + (this.state.hasError ? 'hasError' : '')}>
        <div className="validate-icon-section">
          {this.renderValidateIcon(this.props.formItem)}
        </div>
        {this.renderItem(this.props.formItem)}
        <div className="clear-item" />
      </div>
    );
  }

  renderValidateIcon = formItem => {
    if (this.state.validated) {
      if (formItem.type !== 'checkbox') {
        if (this.state.hasError) {
          return <span className="invalid-icon icon-check" />;
        }
        return <span className="valid-icon icon-check" />;
      }
      return <span className="no-icon" />;
    }
    return <span className="no-icon" />;
  };

  renderItem = formItem => {
    if (formItem.type !== 'checkbox') {
      return (
        <div className="input-data">
          {this.renderInput(this.props.formItem)}
          {this.renderLabel(this.props.formItem)}
          {this.renderIcon(this.props.formItem)}
          {this.renderErrorMessage(this.props.formItem)}
        </div>
      );
    }
    return (
      <CustomCheckbox
        label={formItem.label.text}
        strong={formItem.label.strong}
        status={this.state.isChecked}
        onCheck={this.onCheck}
      />
    );
  };

  onCheck = () => {
    this.setState({ isChecked: !this.state.isChecked });
  };

  renderInput = formItem => {
    return (
      <input
        className={'input-' + formItem.name}
        type={formItem.type}
        placeholder={formItem.placeholder}
      />
    );
  };

  renderLabel = formItem => {
    if (formItem.label.text !== '') {
      return (
        <label className={'label-' + formItem.name}>
          {formItem.label.text}
          <strong> {formItem.label.strong}</strong>
        </label>
      );
    }
    return null;
  };

  renderErrorMessage = formItem => {
    if (this.state.hasError) {
      return (
        <span className={'error-message error-' + formItem.name}>
          {formItem.errorMessage}
        </span>
      );
    }
    return null;
  };

  renderIcon = formItem => {
    if (formItem.icon !== '') {
      return <span className="input-icon icon-search" />;
    }
    return null;
  };
}

FormItem.propTypes = {
  formItem: PropTypes.object
};

export default FormItem;
