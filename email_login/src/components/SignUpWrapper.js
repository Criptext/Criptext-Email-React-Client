import React, { Component } from 'react';
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
    errorMessage: 'Username not available',
    value: '',
    hasError: false
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
    errorMessage: '',
    value: '',
    hasError: false
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
    errorMessage: '',
    value: '',
    hasError: false
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
    errorMessage: 'Password do not match',
    value: '',
    hasError: false
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
    errorMessage: '',
    value: '',
    hasError: false
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
    errorMessage: '',
    value: false,
    hasError: false
  }
];


const onInitState = (array, field) =>
   array.reduce((obj, item) => {
     obj[item[field]] = item.value
     return obj
   }, {})


class SignUpWrapper extends Component {
	constructor(props) {
	  super(props);
	  this.state = {
      values: onInitState(formItems, "name"),
      disabled: true
    };
	  this.handleChange = this.handleChange.bind(this);
	  this.handleSubmit = this.handleSubmit.bind(this);
	}

  componentDidMount(){
    this.checkDisable();
  }

  checkDisable(){
    const values = Object.values(this.state.values);
    this.setState({
      disabled: values.indexOf('')>-1 || values.indexOf(false)>-1
    })
  }

	handleChange(event, field) {
		let newState = this.state
		newState.values[field] = event.target.value;
    this.setState(newState);
    this.checkDisable();
	}

	handleSubmit(event) {
		event.preventDefault();
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
        />
      </div>
		);
	}

}


export default SignUpWrapper;