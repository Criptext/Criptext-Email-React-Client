import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './signup.css';


class FormItem extends Component {

  constructor(props){
    super(props);
    this.state = {
      validated: false,
      hasError: false
    }
  }

  render(){
    return(
      <div className={'form-item '+ (this.state.hasError ? 'hasError' : null)}>
        <div className="validate-icon-section">
          {this.renderValidateIcon(this.props.formItem)}
        </div>
        <div className="input-data">
          {this.renderInput(this.props.formItem)}
          {this.renderLabel(this.props.formItem)}
          {this.renderIcon(this.props.formItem)}
          {this.renderErrorMessage(this.props.formItem)}
        </div>
        <div className="clear-item"></div>
      </div>
    )
  }


  renderValidateIcon = formItem => {
    if (this.state.validated) {
      if (formItem.type!=='checkbox') {
        if (this.state.hasError) {
          return <span className="invalid-icon icon-check"></span>;
        }
        return <span className="valid-icon icon-check"></span>;
      }
      return <span className="no-icon"></span>;
    }
    return <span className="no-icon"></span>;
  }


  renderInput = formItem => {
    return (
      <input
        className={'input-' + formItem.name}
        type={formItem.type}
        placeholder={formItem.placeholder}
      />
    )
  }

  
  renderLabel = formItem => {
    if (formItem.label.text !== '') {
      return(
        <label className={'label-' + formItem.name}>
          {formItem.label.text}
          <strong> {formItem.label.strong}</strong>
        </label>
      )
    }
    return null
  }


  renderErrorMessage = formItem => {
    if (this.state.hasError) {
      return(
        <span className={'error-message error-'+formItem.name}>
          {formItem.errorMessage}
        </span>
      );      
    }
    return null;
  }


  renderIcon = formItem => {
    if (formItem.icon !== '') {
      return <span className="input-icon icon-search"></span> 
    }
    return null;
  }


}



export default FormItem;
