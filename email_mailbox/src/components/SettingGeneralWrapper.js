import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { myAccount, requiredMinLength } from './../utils/electronInterface';
import SettingGeneral from './SettingGeneral';
import { EditorState } from 'draft-js';
import {
  parseSignatureHtmlToEdit,
  parseSignatureContentToHtml
} from '../utils/EmailUtils';

const requiredNameMinLength = requiredMinLength.fullname;

/* eslint-disable-next-line react/no-deprecated */
class SettingGeneralWrapper extends Component {
  constructor(props) {
    super(props);
    this.state = {
      signatureEnabled: undefined,
      signature: EditorState.createEmpty(),
      name: ''
    };
  }

  render() {
    return (
      <SettingGeneral
        name={this.state.name}
        signatureEnabled={this.state.signatureEnabled}
        signature={this.state.signature}
        onChangeInputName={this.handleChangeInputName}
        onChangeTextareaSignature={this.handleChangeTextareaSignature}
        onChangeRadioButtonSignature={this.handleChangeRadioButtonSignature}
      />
    );
  }

  componentDidMount() {
    const signature = parseSignatureHtmlToEdit(myAccount.signature);
    this.setState({
      name: myAccount.name,
      signature,
      signatureEnabled: !!myAccount.signatureEnabled
    });
  }

  handleChangeInputName = async ev => {
    if (ev.target.value <= requiredNameMinLength) {
      ev.preventDefault();
    } else {
      this.setState({ name: ev.target.value });
      await this.props.onUpdateAccount({ name: ev.target.value });
    }
  };

  handleChangeTextareaSignature = signatureContent => {
    this.setState({ signature: signatureContent }, async () => {
      const htmlSignature = parseSignatureContentToHtml(signatureContent);
      await this.props.onUpdateAccount({ signature: htmlSignature });
    });
  };

  handleChangeRadioButtonSignature = async value => {
    await this.props.onUpdateAccount({ signatureEnabled: value });
    this.setState({ signatureEnabled: value });
  };
}

SettingGeneralWrapper.propTypes = {
  onUpdateAccount: PropTypes.func
};

export default SettingGeneralWrapper;
