import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { EDITING_MODES } from './SettingAccountWrapper';
import SettingsGeneralProfile from './SettingsGeneralProfile';
import { myAccount } from './../utils/electronInterface';
import { EditorState } from 'draft-js';
import { validateFullname } from '../validators/validators';
import {
  parseSignatureContentToHtml,
  parseSignatureHtmlToEdit
} from '../utils/EmailUtils';

class SettingGeneralProfileWrapper extends Component {
  constructor(props) {
    super(props);
    this.state = {
      mode: EDITING_MODES.NONE,
      nameParams: {
        name: myAccount.name
      },
      signatureParams: {
        signature: EditorState.createEmpty(),
        signatureEnabled: undefined
      },
      avatarParams: {
        showImage: true,
        isLoading: false
      }
    };
  }

  render() {
    return (
      <SettingsGeneralProfile
        avatarIsLoading={this.state.avatarParams.isLoading}
        showAvatar={this.state.avatarParams.showImage}
        avatarUrl={this.props.avatarUrl}
        name={this.state.nameParams.name}
        mode={this.state.mode}
        onChangeAvatar={this.handleChangeAvatar}
        onErrorAvatar={this.handleErrorAvatar}
        onAddNameInputKeyPressed={this.handleAddNameInputKeyPressed}
        onBlurInputName={this.handleBlurInputName}
        onChangeInputName={this.handleChangeInputName}
        onChangeRadioButtonSignature={this.handleChangeRadioButtonSignature}
        onChangeTextareaSignature={this.handleChangeTextareaSignature}
        onClickEditName={this.handleClickEditName}
        onRemoveAvatar={this.handleRemoveAvatar}
        signatureEnabled={this.state.signatureParams.signatureEnabled}
        signature={this.state.signatureParams.signature}
      />
    );
  }

  /* eslint-disable-next-line react/no-deprecated */
  componentWillMount() {
    const signatureParams = {
      signature: parseSignatureHtmlToEdit(myAccount.signature),
      signatureEnabled: !!myAccount.signatureEnabled
    };
    this.setState({ signatureParams });
  }

  handleBlurInputName = e => {
    const currentTarget = e.currentTarget;
    if (!currentTarget.contains(document.activeElement)) {
      const nameParams = { name: myAccount.name };
      this.setState({
        mode: EDITING_MODES.NONE,
        nameParams
      });
    }
  };

  handleClickEditName = () => {
    this.setState({ mode: EDITING_MODES.EDITING_NAME });
  };

  handleChangeInputName = ev => {
    this.setState({
      nameParams: {
        name: ev.target.value
      }
    });
  };

  handleAddNameInputKeyPressed = async e => {
    const inputValue = e.target.value.trim();
    const isValidName = validateFullname(inputValue);
    if (e.key === 'Enter' && inputValue !== '' && isValidName) {
      await this.props.onUpdateAccount({ name: inputValue });
      await this.props.onUpdateContact(inputValue);
      const nameParams = { name: inputValue };
      this.setState({
        nameParams,
        mode: EDITING_MODES.NONE
      });
    }
  };

  handleChangeTextareaSignature = signatureContent => {
    const signatureParams = {
      ...this.state.signatureParams,
      signature: signatureContent
    };
    this.setState({ signatureParams }, async () => {
      let htmlSignature = parseSignatureContentToHtml(signatureContent);
      htmlSignature = htmlSignature
        .replace(/<p><\/p>/g, '</br>')
        .replace(/<p>/g, '<div>')
        .replace(/<\/p>/g, '</div>');
      await this.props.onUpdateAccount({ signature: htmlSignature });
    });
  };

  handleChangeRadioButtonSignature = async ev => {
    const value = ev.target.checked;
    await this.props.onUpdateAccount({ signatureEnabled: value });
    const signatureParams = {
      ...this.state.signatureParams,
      signatureEnabled: value
    };
    this.setState({ signatureParams });
  };

  handleRemoveAvatar = () => {
    this.setState(
      {
        avatarParams: {
          ...this.state.avatarParams,
          isLoading: true
        }
      },
      () => {
        this.handleRemoveAvatarRequest();
      }
    );
  };

  handleRemoveAvatarRequest = async () => {
    const SUCCESS_STATUS = 200;
    const status = await this.props.onRemoveAvatar();
    if (status === SUCCESS_STATUS) {
      return this.setState({
        avatarParams: {
          showImage: false,
          isLoading: false
        }
      });
    }
    this.setState({
      avatarParams: {
        showImage: true,
        isLoading: false
      }
    });
  };

  handleChangeAvatar = ev => {
    const files = ev.dataTransfer ? ev.dataTransfer.files : ev.target.files;
    const file = files[0];
    if (!file) {
      return;
    }
    this.setState(
      {
        avatarParams: {
          ...this.state.avatarParams,
          isLoading: true
        }
      },
      () => {
        this.handleChangeAvatarRequest(file);
      }
    );
  };

  handleChangeAvatarRequest = async file => {
    const SUCCESS_STATUS = 200;
    const status = await this.props.onUploadAvatar({
      path: file.path,
      contentLength: file.size,
      contentType: file.type
    });
    if (status === SUCCESS_STATUS) {
      return this.setState({
        avatarParams: {
          showImage: true,
          isLoading: false
        }
      });
    }
    this.setState({
      avatarParams: {
        showImage: false,
        isLoading: false
      }
    });
  };

  handleErrorAvatar = () => {
    this.setState({
      avatarParams: {
        ...this.state.avatarParams,
        showImage: false
      }
    });
  };
}

SettingGeneralProfileWrapper.propTypes = {
  avatarUrl: PropTypes.string,
  onRemoveAvatar: PropTypes.func,
  onUploadAvatar: PropTypes.func,
  onUpdateAccount: PropTypes.func,
  onUpdateContact: PropTypes.func
};

export default SettingGeneralProfileWrapper;
