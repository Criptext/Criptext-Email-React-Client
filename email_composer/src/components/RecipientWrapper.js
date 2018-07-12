import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Recipient from './Recipient';
import { emailRegex } from './../utils/RegexUtils';

class RecipientWrapper extends Component {
  render() {
    return (
      <Recipient
        {...this.props}
        bccTags={this.props.bccEmails}
        ccTags={this.props.ccEmails}
        emailRegex={emailRegex}
        isCollapsedMoreRecipient={this.props.isCollapsedMoreRecipient}
        onToggleRecipient={this.props.onToggleRecipient}
        onChangeBccTag={this.handleOnChangeBccTag}
        onChangeCcTag={this.handleOnChangeCcTag}
        onChangeToTag={this.handleOnChangeToTag}
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

  handleOnChangeBccTag = tags => {
    this.props.getBccEmails(tags);
  };

  handleOnChangeCcTag = tags => {
    this.props.getCcEmails(tags);
  };

  handleOnChangeToTag = tags => {
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
