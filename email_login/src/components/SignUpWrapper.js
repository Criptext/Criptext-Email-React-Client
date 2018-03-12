import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  validateUsername,
  validateFullname,
  validatePassword,
  validateConfirmPassword,
  validateAcceptTerms,
  validateEmail
} from './../validators/validators';
import { signUpAccount } from './../actions/index';
import { closeDialog, confirmEmptyEmail } from './../utils/electronInterface';
import SignUp from './SignUp';

const formItems = [
  {
    name: 'username',
    placeholder: 'Username',
    type: 'text',
    label: {
      text: '@criptext.com',
      strong: ''
    },
    icon: '',
    icon2: '',
    errorMessage: 'Username not available',
    value: '',
    optional: false
  },
  {
    name: 'fullname',
    placeholder: 'Full name',
    type: 'text',
    label: {
      text: '',
      strong: ''
    },
    icon: '',
    icon2: '',
    errorMessage: '',
    value: '',
    optional: false
  },
  {
    name: 'password',
    placeholder: 'Password',
    type: 'password',
    label: {
      text: '',
      strong: ''
    },
    icon: 'icon-show',
    icon2: 'icon-not-show',
    errorMessage: '',
    value: '',
    optional: false
  },
  {
    name: 'confirmpassword',
    placeholder: 'Confirm password',
    type: 'password',
    label: {
      text: '',
      strong: ''
    },
    icon: 'icon-show',
    icon2: 'icon-not-show',
    errorMessage: 'Passwords do not match',
    value: '',
    optional: false
  },
  {
    name: 'recoveryemail',
    placeholder: 'Recovery email (optional)',
    type: 'text',
    label: {
      text: '',
      strong: ''
    },
    icon: '',
    icon2: '',
    errorMessage: 'Email invalid',
    value: '',
    optional: true
  },
  {
    name: 'acceptterms',
    placeholder: '',
    type: 'checkbox',
    label: {
      text: 'I have read and agree with the ',
      strong: 'Terms and Conditions'
    },
    icon: '',
    icon2: '',
    errorMessage: '',
    value: false,
    optional: false
  }
];

const onInitState = (array, field) =>
  array.reduce((obj, item) => {
    obj[item[field]] = item.value;
    return obj;
  }, {});

const onInitErrors = (array, field) =>
  array.reduce((obj, item) => {
    obj[item[field]] = false;
    return obj;
  }, {});

class SignUpWrapper extends Component {
  constructor(props) {
    super(props);
    this.state = {
      values: onInitState(formItems, 'name'),
      errors: onInitErrors(formItems, 'name'),
      disabled: true
    };
    this.universalValidator = this.universalValidator.bind(this);
    this.onSetError = this.onSetError.bind(this);
  }

  render() {
    return (
      <div>
        <SignUp
          {...this.props}
          states={this.state}
          items={formItems}
          onChangeField={this.handleChange}
          disabled={this.state.disabled}
          handleSubmit={this.handleSubmit}
          validator={this.universalValidator}
          errors={this.state.errors}
          onSetError={this.onSetError}
        />
      </div>
    );
  }

  checkDisable = () => {
    var disabled = false;
    const errors = {};
    formItems.forEach(formItem => {
      if (
        !formItem.optional ||
        (formItem.optional && this.state.values[formItem.name] !== '')
      ) {
        const result = this.universalValidator(
          formItem.name,
          this.state.values[formItem.name]
        );
        errors[formItem.name] = !result;
        disabled = disabled || !result;
      }
    });
    this.setState({
      disabled: disabled,
      errors: errors
    });
  };

  onSetError = (formItemName, errorValue) => {
    const errors = this.state.errors;
    errors[formItemName] = errorValue;
    this.setState({ errors: errors });
  };

  handleChange = (event, field) => {
    const newState = this.state;
    newState.values[field] = event.target.value;
    this.setState(newState);
    this.checkDisable();
  };

  handleSubmit = event => {
    event.preventDefault();
    event.stopPropagation();
    const values = this.state.values;

    if (values.recoveryemail !== '') {
      this.onSubmit(values);
    } else {
      confirmEmptyEmail(response => {
        closeDialog();
        if (response === 'Confirm') {
          this.onSubmit(values);
        }
      });
    }
  };

  onSubmit = values => {
    const submitValues = {
      username: values.username,
      password: values.password,
      name: values.fullname,
      recoveryEmail: values.recoveryemail
    };
    signUpAccount(submitValues);
  };

  universalValidator = (formItemName, formItemValue) => {
    let result;
    switch (formItemName) {
      case 'username': {
        result = validateUsername(formItemValue);
        break;
      }
      case 'fullname': {
        result = validateFullname(formItemValue);
        break;
      }
      case 'password': {
        result = validatePassword(formItemValue);
        break;
      }
      case 'confirmpassword': {
        const password = this.state.values['password'];
        result = validateConfirmPassword(password, formItemValue);
        break;
      }
      case 'recoveryemail': {
        result = validateEmail(formItemValue);
        break;
      }
      default:
        result = validateAcceptTerms(formItemValue);
    }
    return result;
  };
}

SignUpWrapper.propTypes = {
  onAddUser: PropTypes.func
};

export default SignUpWrapper;
