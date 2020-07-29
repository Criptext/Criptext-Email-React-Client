import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import PropTypes from 'prop-types';

const ALERT_COLOR = '#ff5555';
const CRIPTEXT_COLOR = '#0091ff';

const CustomTextField = withStyles({
  root: {
    margin: '14px 0px',
    fontFamily: 'NunitoSans',
    fontSize: 13,
    position: 'relative',
    '& input': {
      fontFamily: 'NunitoSans',
      fontSize: 13
    },
    '& label': {
      fontFamily: 'NunitoSans',
      fontSize: 13
    },
    '& p': {
      fontFamily: 'NunitoSans',
      fontSize: 12
    },
    '& p.MuiFormHelperText-root': {
      fontFamily: 'NunitoSans',
      fontSize: 12,
      letterSpacing: 0,
      color: ALERT_COLOR,
      position: 'absolute',
      top: 45
    },
    '& label.MuiInputLabel-shrink': {
      transform: 'translate(0, 5px) scale(1)'
    },
    '& label.Mui-focused': {
      color: CRIPTEXT_COLOR
    },
    '& label.Mui-error': {
      color: ALERT_COLOR
    },
    '& .MuiInput-underline:after': {
      borderBottomColor: CRIPTEXT_COLOR
    },
    '& .MuiInput-underline.Mui-error:after': {
      borderBottomColor: ALERT_COLOR,
    },
    '& .MuiOutlinedInput-root': {
      '&.Mui-focused fieldset': {
        borderColor: CRIPTEXT_COLOR
      }
    }
  }
})(TextField);

export default CustomTextField;