import React, { Component } from 'react';
import PropTypes from 'prop-types';
import FormItem from './FormItem';
import './signup.css';

class SignUp extends Component {
  constructor() {
    super();
    this.formItems = [
      {
        name: 'username',
        placeholder: 'Username',
        type: 'text',
        label: {
          text: '@criptext.com',
          strong: ''
        },
        icon: '',
        errorMessage: 'Username not available'
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
        errorMessage: ''
      },
      {
        name: 'password',
        placeholder: 'Password',
        type: 'password',
        label: {
          text: '',
          strong: ''
        },
        icon: 'icon-eye',
        errorMessage: ''
      },
      {
        name: 'confirmpassword',
        placeholder: 'Confirm password',
        type: 'password',
        label: {
          text: '',
          strong: ''
        },
        icon: 'icon-eye',
        errorMessage: 'Password do not match'
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
        errorMessage: ''
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
        errorMessage: ''
      }
    ];
  }

  render() {
    return (
      <div className="signup">
        {this.renderHeader()}
        {this.renderForm(this.formItems)}
      </div>
    );
  }

  renderHeader = () => {
    return (
      <div className="header">
        <div className="button-section">
          <button
            className="back-button"
            onClick={ev => this.props.toggleSignUp(ev)}
          >
            <i className="icon-back" />
          </button>
        </div>
        <div className="criptext-logo">
          <div className="icon" />
        </div>
        <div className="header-clear" />
      </div>
    );
  };

  renderForm = formItems => {
    return (
      <div className="form">
        <div className="header">
          <p>Sign Up</p>
          <p>Create your Criptext account</p>
        </div>
        <div className="signup-form">
          <form>
            {formItems.map((formItem, index) => {
              return <FormItem key={index} 
                formItem={formItem}/>
            })}
            <div className="button">
              <button className="create-button">
                <span>Create account</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };
}

SignUp.propTypes = {
  toggleSignUp: PropTypes.func
};

export default SignUp;
