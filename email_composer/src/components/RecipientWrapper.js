import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Recipient from './Recipient';
import { emailRegex } from './../utils/RegexUtils';

class RecipientWrapper extends Component {
  constructor(props) {
    super(props);
    this.state = {
      inputBccValue: '',
      inputCcValue: '',
      inputToValue: '',
      inputFocus: false
    };
  }

  render() {
    return (
      <Recipient
        {...this.props}
        bccTags={this.props.bccEmails}
        ccTags={this.props.ccEmails}
        emailRegex={emailRegex}
        inputBccValue={this.state.inputBccValue}
        inputCcValue={this.state.inputCcValue}
        inputToValue={this.state.inputToValue}
        isCollapsedMoreRecipient={this.props.isCollapsedMoreRecipient}
        onToggleRecipient={this.props.onToggleRecipient}
        onBlurTag={this.handleBlurTag}
        onChangeBccTag={this.handleChangeBccTag}
        onChangeCcTag={this.handleChangeCcTag}
        onChangeToTag={this.handleChangeToTag}
        onChangeBccInput={this.handleChangeBccInput}
        onChangeCcInput={this.handleChangeCcInput}
        onChangeToInput={this.handleChangeToInput}
        onChangeTag={this.handleChangeTag}
        onDoubleClickTag={this.handleDoubleClickTag}
        onValidationRejectBccTag={this.handleOnValidationRejectBccTag}
        onValidationRejectCcTag={this.handleOnValidationRejectCcTag}
        onValidationRejectToTag={this.handleOnValidationRejectToTag}
        toTags={this.props.toEmails}
        checkDisableSendButton={this.handleCheckDisableSendButton}
      />
    );
  }

  handleBlurTag = (e, type, key) => {
    const value = e.target.value;
    this.props.tagBlured(type, key, value);
  };

  handleCheckDisableSendButton = isValidEmailAddress => {
    if (!isValidEmailAddress) {
      this.props.disableSendButton();
    }
  };

  handleChangeBccInput = text => {
    this.setState({ inputBccValue: text ? text.replace(';', '') : text });
  };

  handleChangeCcInput = text => {
    this.setState({ inputCcValue: text ? text.replace(';', '') : text });
  };

  handleChangeToInput = text => {
    this.setState({ inputToValue: text ? text.replace(';', '') : text });
  };

  handleChangeBccTag = tags => {
    this.props.getBccEmails(tags);
  };

  handleChangeCcTag = tags => {
    this.props.getCcEmails(tags);
  };

  handleChangeToTag = tags => {
    this.props.getToEmails(tags);
  };

  handleChangeTag = (e, type, key) => {
    const value = e.target.value;
    this.props.tagChanged(type, key, value);
  };

  handleDoubleClickTag = (type, key) => {
    this.props.tagUpdated(type, key);
  };

  handleOnValidationRejectBccTag = tags => {
    if (tags[0] === '') return;
  };

  handleOnValidationRejectCcTag = tags => {
    if (tags[0] === '') return;
  };

  handleOnValidationRejectToTag = tags => {
    if (tags[0] === '') return;
  };
}

RecipientWrapper.propTypes = {
  bccEmails: PropTypes.array,
  ccEmails: PropTypes.array,
  disableSendButton: PropTypes.func,
  getBccEmails: PropTypes.func,
  getCcEmails: PropTypes.func,
  getToEmails: PropTypes.func,
  isCollapsedMoreRecipient: PropTypes.bool,
  onToggleRecipient: PropTypes.func,
  tagBlured: PropTypes.func,
  tagChanged: PropTypes.func,
  tagUpdated: PropTypes.func,
  toEmails: PropTypes.array
};

export default RecipientWrapper;
