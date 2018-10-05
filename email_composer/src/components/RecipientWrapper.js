import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Recipient from './Recipient';
import { RegexUtils } from './../utils/electronUtilsInterface';

class RecipientWrapper extends Component {
  constructor(props) {
    super(props);
    this.state = {
      inputBccValue: '',
      inputCcValue: '',
      inputToValue: ''
    }
  }

  render() {
    return (
      <Recipient
        {...this.props}
        bccTags={this.props.bccEmails}
        ccTags={this.props.ccEmails}
        emailRegex={RegexUtils.emailRegex}
        inputBccValue={this.state.inputBccValue}
        inputCcValue={this.state.inputCcValue}
        inputToValue={this.state.inputToValue}
        isCollapsedMoreRecipient={this.props.isCollapsedMoreRecipient}
        onToggleRecipient={this.props.onToggleRecipient}
        onChangeBccTag={this.handleChangeBccTag}
        onChangeCcTag={this.handleChangeCcTag}
        onChangeToTag={this.handleChangeToTag}
        onChangeBccInput={this.handleChangeBccInput}
        onChangeCcInput={this.handleChangeCcInput}
        onChangeToInput={this.handleChangeToInput}
        onValidationRejectBccTag={this.handleOnValidationRejectBccTag}
        onValidationRejectCcTag={this.handleOnValidationRejectCcTag}
        onValidationRejectToTag={this.handleOnValidationRejectToTag}
        toTags={this.props.toEmails}
        checkDisableSendButton={this.handleCheckDisableSendButton}
      />
    );
  }

  handleCheckDisableSendButton = isValidEmailAddress => {
    if (!isValidEmailAddress) {
      this.props.disableSendButton();
    }
  };

  handleChangeBccInput = text => {
    this.setState({inputBccValue: text.replace(';', '')});
  }

  handleChangeCcInput = text => {
    this.setState({inputCcValue: text.replace(';', '')});
  }

  handleChangeToInput = text => {
    this.setState({inputToValue: text.replace(';', '')});
  }

  handleChangeBccTag = tags => {
    this.props.getBccEmails(tags);
  };

  handleChangeCcTag = tags => {
    this.props.getCcEmails(tags);
  };

  handleChangeToTag = tags => {
    this.props.getToEmails(tags);
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
  toEmails: PropTypes.array
};

export default RecipientWrapper;
