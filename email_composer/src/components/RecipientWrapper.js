import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Recipient from './Recipient';
import { emailRegex } from './../utils/RegexUtils';

class RecipientWrapper extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isCollapsedMoreRecipient: true
    };
  }

  render() {
    const toPlaceholder = this.props.toEmails.length > 0 ? '' : 'To';
    const ccPlaceholder = this.props.ccEmails.length > 0 ? '' : 'Cc';
    const bccPlaceholder = this.props.bccEmails.length > 0 ? '' : 'Bcc';
    return (
      <Recipient
        {...this.props}
        isCollapsedMoreRecipient={this.state.isCollapsedMoreRecipient}
        bccPlaceholder={bccPlaceholder}
        bccTags={this.props.bccEmails}
        ccPlaceholder={ccPlaceholder}
        ccTags={this.props.ccEmails}
        emailRegex={emailRegex}
        onToggleRecipient={this.handleToggleRecipient}
        onChangeBccTag={this.handleOnChangeBccTag}
        onChangeCcTag={this.handleOnChangeCcTag}
        onChangeToTag={this.handleOnChangeToTag}
        onValidationRejectBccTag={this.handleOnValidationRejectBccTag}
        onValidationRejectCcTag={this.handleOnValidationRejectCcTag}
        onValidationRejectToTag={this.handleOnValidationRejectToTag}
        toPlaceholder={toPlaceholder}
        toTags={this.props.toEmails}
      />
    );
  }

  handleToggleRecipient = () => {
    this.setState({
      isCollapsedMoreRecipient: !this.state.isCollapsedMoreRecipient
    });
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
  getBccEmails: PropTypes.func,
  getCcEmails: PropTypes.func,
  getToEmails: PropTypes.func,
  toEmails: PropTypes.array
};

export default RecipientWrapper;
