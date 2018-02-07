import React, { Component } from 'react';
import validator from 'validator';
import { 
  showDialog, 
  closeDialog, 
  openMailbox,
  closeLogin
} from './../utils/electronInterface';
import SignUp from './SignUp';


let formItems = [
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
     obj[item[field]] = item.value
     return obj
   }, {})


const checkRequired = (field) => {
  return field!==undefined;
}
const checkminLength = (field, length) => {
  return field.length>length;
}
const checkMatch = (field1, field2) => {
  return field1===field2;
}



class SignUpWrapper extends Component {
	constructor(props) {
	  super(props);
	  this.state = {
      values: onInitState(formItems, "name"),
      disabled: true
    };
    this.validators = {
      username: () => this.validateUsername(),
      fullname: () => this.validateFullname(),
      password: () => this.validatePassword(),
      confirmpassword: () => this.validateConfirmPassword(),
      acceptterms: () => this.validateAcceptTerms(),
      recoveryemail: () => this.validateEmail()
    }
	}


  componentDidMount(){
    this.checkDisable();
  }


  render(){
    return(
      <div>
        <SignUp
          {...this.props} 
          states={this.state} 
          items={formItems}
          onChangeField={this.handleChange}
          disabled={this.state.disabled}
          handleSubmit={this.handleSubmit}
          validators={this.validators}
        />
      </div>
    );
  }


  checkDisable = () => {
    var disabled = false;
    formItems.forEach(formItem => {
      if (!formItem.optional || (formItem.optional && this.state.values[formItem.name])){
        const result = this.validators[formItem.name]();
        disabled = disabled || !result;
      } 
    });
    this.setState({
      disabled: disabled
    })
  }


	handleChange = (event, field) => {
		let newState = this.state
		newState.values[field] = event.target.value;
    this.setState(newState);
    this.checkDisable();
	}


	handleSubmit = (event) => {
		event.preventDefault();
    event.stopPropagation();
    const values = this.state.values;

    if ( values.recoveryemail !== '' ) {
      this.onSubmit(values);
    }
    else {
      showDialog( response => {
        closeDialog();
        if ( response === "Confirm" ) {
          this.onSubmit(values);
        }
      });
    }
	}


  onSubmit = (formValues) => {
    closeLogin();
    openMailbox();
  }


  validateUsername = () => {
    const username = this.state.values['username'];
    return checkRequired(username) && checkminLength(username,1);
  }
  validateFullname = () => {
    const fullname = this.state.values['fullname'];
    return checkRequired(fullname) && checkminLength(fullname,1);
  }
  validatePassword = () => {
    const pass = this.state.values['password'];
    const checkPass = checkRequired(pass) && checkminLength(pass,1);
    return checkPass;
  }
  validateConfirmPassword = () => {
    const field1 = this.state.values['password'];
    const field2 = this.state.values['confirmpassword'];
    const required = checkRequired(field1) && checkRequired(field2);
    const length = checkminLength(field1,1) && checkminLength(field2,1);
    const match = checkMatch(field1, field2);
    return required && length && match;
  }
  validateAcceptTerms = () => {
    const field = this.state.values["acceptterms"];
    return field===true;
  }
  validateEmail = () => {
    const field = this.state.values["recoveryemail"];
    return validator.isEmail(field);
  }


}


export default SignUpWrapper;