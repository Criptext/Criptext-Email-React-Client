import React, { Component } from 'react';
import { emailRegex } from './../utils/RegexUtils';
import Recipient from './Recipient';

class RecipientWrapper extends Component {
  constructor(props) {
    super(props);
    this.state = {
      displayMoreRecipient: false,
      toTags: [],
      ccTags: [],
      bccTags: []
    };
  }

  render() {
    const toPlaceholder = this.state.toTags.length > 0 ? '' : 'To';
    const ccPlaceholder = this.state.ccTags.length > 0 ? '' : 'Cc';
    const bccPlaceholder = this.state.bccTags.length > 0 ? '' : 'Bcc';
    return (
      <Recipient
        {...this.props}
        displayMoreRecipient={this.state.displayMoreRecipient}
        bccPlaceholder={bccPlaceholder}
        bccTags={this.state.bccTags}
        ccPlaceholder={ccPlaceholder}
        ccTags={this.state.ccTags}
        emailRegex={emailRegex}
        onToggleRecipient={this.handleToggleRecipient}
        onChangeBccTag={this.handleOnChangeBccTag}
        onChangeCcTag={this.handleOnChangeCcTag}
        onChangeToTag={this.handleOnChangeToTag}
        onValidationRejectBccTag={this.handleOnValidationRejectBccTag}
        onValidationRejectCcTag={this.handleOnValidationRejectCcTag}
        onValidationRejectToTag={this.handleOnValidationRejectToTag}
        toPlaceholder={toPlaceholder}
        toTags={this.state.toTags}
      />
    );
  }

  handleToggleRecipient = () => {
    this.setState({
      displayMoreRecipient: !this.state.displayMoreRecipient
    });
  };

  handleOnChangeBccTag = tags => {
    this.setState({ bccTags: tags });
  };

  handleOnChangeCcTag = tags => {
    this.setState({ ccTags: tags });
  };

  handleOnChangeToTag = tags => {
    this.setState({ toTags: tags });
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

export default RecipientWrapper;
