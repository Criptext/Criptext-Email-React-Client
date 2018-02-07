import React from 'react';
import PropTypes from 'prop-types';
import FormItemWrapper from './FormItemWrapper';
import './signup.css';


const SignUp = props => renderSignUp(props);


const renderSignUp = (props) => (
  <div className="signup">
    {renderHeader(props)}
    {renderForm(props)}
  </div>
);


const renderHeader = props => (
  <div className="header">
    <div className="button-section">
      <button className="back-button" onClick={ev => props.toggleSignUp(ev)}>
        <i className="icon-back" />
      </button>
    </div>
    <div className="criptext-logo">
      <div className="icon" />
    </div>
    <div className="header-clear" />
  </div>
);


const renderForm = props => (
  <div className="form">
    <div className="header">
      <p>Sign Up</p>
      <p>Create your Criptext account</p>
    </div>
    <div className="signup-form">
      <form autoComplete="off">
        {props.items.map((formItem, index) => {
          return <FormItemWrapper 
              key={index} 
              formItem={formItem} 
              onChange={props.onChangeField} 
              validator={props.validators[formItem.name]}
            />;
        })}
        <div className="button">
          <button 
            className="create-button" 
            onClick={ev => props.handleSubmit(ev)} 
            disabled={props.disabled}>
            <span>Create account</span>
          </button>
        </div>
      </form>
    </div>
  </div>
);


renderHeader.propTypes = {
  toggleSignUp: PropTypes.func
};


export default SignUp;
