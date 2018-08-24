import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { myAccount, requiredMinLength } from './../utils/electronInterface';
import SettingGeneral from './SettingGeneral';
import { EditorState } from 'draft-js';
import {
  parseSignatureHtmlToEdit,
  parseSignatureContentToHtml
} from '../utils/EmailUtils';
import { sendRemoveDeviceErrorMessage } from '../utils/electronEventInterface';

const requiredNameMinLength = requiredMinLength.fullname;

const inputNameModes = {
  EDITING: 'editing',
  NONE: 'none'
};

/* eslint-disable-next-line react/no-deprecated */
class SettingGeneralWrapper extends Component {
  constructor(props) {
    super(props);
    this.state = {
      signatureEnabled: undefined,
      signature: EditorState.createEmpty(),
      name: '',
      mode: inputNameModes.NONE
    };
  }

  render() {
    return (
      <SettingGeneral
        name={this.state.name}
        signatureEnabled={this.state.signatureEnabled}
        signature={this.state.signature}
        onBlurInputName={this.handleBlurInputName}
        onChangeInputName={this.handleChangeInputName}
        onChangeTextareaSignature={this.handleChangeTextareaSignature}
        onChangeRadioButtonSignature={this.handleChangeRadioButtonSignature}
        onClickEditName={this.handleClickEditName}
        onAddNameInputKeyPressed={this.handleAddNameInputKeyPressed}
        mode={this.state.mode}
        onClickLogout={this.handleClickLogout}
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

  handleBlurInputName = e => {
    const currentTarget = e.currentTarget;
    if (!currentTarget.contains(document.activeElement)) {
      this.setState({
        mode: inputNameModes.NONE
      });
    }
  };

  handleClickEditName = () => {
    this.setState({ mode: inputNameModes.EDITING });
  };

  handleChangeInputName = ev => {
    this.setState({ name: ev.target.value });
  };

  handleAddNameInputKeyPressed = async e => {
    const inputValue = e.target.value.trim();
    const isValidName = inputValue.length >= requiredNameMinLength;
    if (e.key === 'Enter' && inputValue !== '' && isValidName) {
      await this.props.onUpdateAccount({ name: inputValue });
      this.setState({
        name: myAccount.name,
        mode: inputNameModes.NONE
      });
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

  handleClickLogout = async () => {
    const isSuccess = await this.props.onLogout();
    if (isSuccess) {
      await this.props.onDeleteDeviceData();
    } else {
      sendRemoveDeviceErrorMessage();
    }
  };
}

SettingGeneralWrapper.propTypes = {
  onDeleteDeviceData: PropTypes.func,
  onLogout: PropTypes.func,
  onUpdateAccount: PropTypes.func
};

export { SettingGeneralWrapper as default, inputNameModes };
