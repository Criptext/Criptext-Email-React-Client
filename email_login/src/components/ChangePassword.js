import React from 'react';
import PropTypes from 'prop-types';
import FormItem from './FormItem';
import string from '../lang';
import './changepassword.scss';

const { changePassword } = string;

const ChangePassword = props => (
  <div id="section-changepassword">
    <div className="section-wrapper">
      <h1>{changePassword.title}</h1>
      <span className="description">{props.emailAddress}</span>
      <div className="form">
        {props.items.map((formItem, index) => {
          return (
            <FormItem
              key={index}
              formItem={formItem}
              onChange={props.onChangeInput}
              isShowingPassword={props.isShowingPassword}
              onToggleShowPassword={props.onToggleShowPassword}
              value={props.values[formItem.name]}
              error={props.errors[formItem.name]}
            />
          );
        })}
      </div>
      <div className="buttons">
        <button
          onClick={() => props.onClickChangePassword()}
          disabled={props.disabled}
        >
          <span>{changePassword.button}</span>
        </button>
      </div>
    </div>
  </div>
);

ChangePassword.propTypes = {
  disabled: PropTypes.bool,
  emailAddress: PropTypes.string,
  errors: PropTypes.object,
  isShowingPassword: PropTypes.bool,
  items: PropTypes.array,
  onChangeInput: PropTypes.func,
  onClickChangePassword: PropTypes.func,
  onToggleShowPassword: PropTypes.func,
  values: PropTypes.string
};

export default ChangePassword;
