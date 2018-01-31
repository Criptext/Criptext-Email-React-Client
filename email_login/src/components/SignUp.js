import React from 'react';
import PropTypes from 'prop-types';
import FormItemWrapper from './FormItemWrapper';
import './signup.css';


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


const SignUp = props => renderSignUp(props, formItems);


const renderSignUp = (props, items) => (
  <div className="signup">
    {renderHeader(props)}
    {renderForm(items)}
  </div>
);


const renderHeader = props => (
  <div className="header">
    <div className="button-section">
      <button
        className="back-button"
        onClick={ev => props.toggleSignUp(ev)}
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


const renderForm = items => (
  <div className="form">
    <div className="header">
      <p>Sign Up</p>
      <p>Create your Criptext account</p>
    </div>
    <div className="signup-form">
      <form>
        {items.map((formItem, index) => {
          return <FormItemWrapper key={index} formItem={formItem} />;
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


SignUp.propTypes = {
  toggleSignUp: PropTypes.func
};


export default SignUp;
