import React, { Component } from 'react';
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
          text: '@criptext',
          strong: ''
        }
      },
      {
        name: 'fullname',
        placeholder: 'Full name',
        type: 'text',
        label: {
          text: '',
          strong: ''
        }
      },
      {
        name: 'password',
        placeholder: 'Password',
        type: 'password',
        label: {
          text: '',
          strong: ''
        }
      },
      {
        name: 'confirmpassword',
        placeholder: 'Confirm password',
        type: 'password',
        label: {
          text: '',
          strong: ''
        }
      },
      {
        name: 'recoveryemail',
        placeholder: 'Recovery email (optional)',
        type: 'text',
        label: {
          text: '',
          strong: ''
        }
      },
      {
        name: 'acceptterms',
        placeholder: '',
        type: 'checkbox',
        label: {
          text: 'I have read and agree with the ',
          strong: 'Terms and conditions'
        }
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
          <button className="back-button">
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
              return <FormItem key={index} formItem={formItem} />;
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

export default SignUp;
