import React from 'react';
import PropTypes from 'prop-types';
import { myAccount } from './../utils/electronInterface';
import { getTwoCapitalLetters } from './../utils/StringUtils';
import { appDomain } from '../utils/const';
import { Switch } from 'react-switch-input';
import { EDITING_MODES } from './SettingGeneralWrapper';
import { Editor } from 'react-draft-wysiwyg';
import string from '../lang';

const SettingsGeneralProfile = props => (
  <div id="settings-general-profile" className="section-block">
    <div className="section-block-title">
      <h1>{string.settings.profile}</h1>
    </div>
    <div className="section-block-content">
      {renderBlockEmail(props)}
      {renderBlockName(props)}
      {renderBlockSignature(props)}
    </div>
  </div>
);

const renderBlockEmail = props => (
  <div className="section-block-content-item">
    <div className="general-letters">
      {props.showAvatar ? (
        <img
          src={props.avatarUrl}
          onError={props.onErrorAvatar}
          alt="user avatar"
        />
      ) : (
        <span>{getTwoCapitalLetters(myAccount.name)}</span>
      )}
      <div className="general-avatar-edit">
        <span>edit</span>
      </div>
      <input type="file" accept="image/*" onChange={props.onChangeAvatar} />
      {props.avatarIsLoading && (
        <div className="general-avatar-loading-overlay">
          <Loading />
        </div>
      )}
    </div>
    <label>{`${myAccount.recipientId}@${appDomain}`}</label>
  </div>
);

const renderBlockName = props => (
  <div className="section-block-content-item" onBlur={props.onBlurInputName}>
    <span className="section-block-content-item-title">
      {string.settings.name}
    </span>
    {props.mode === EDITING_MODES.EDITING_NAME ? (
      <div>
        <input
          className="input-a"
          type="text"
          placeholder="Enter new name"
          value={props.name}
          onChange={ev => props.onChangeInputName(ev)}
          onKeyPress={e => props.onAddNameInputKeyPressed(e)}
          autoFocus={true}
        />
        <button className="button-b" onClick={props.onBlurInputName}>
          <span>Cancel</span>
        </button>
      </div>
    ) : (
      <div className="profile-name">
        <span onDoubleClick={props.onClickEditName}>{myAccount.name}</span>
        <i
          className="icon-pencil"
          title="Edit name"
          onClick={props.onClickEditName}
        />
      </div>
    )}
  </div>
);

const renderBlockSignature = props => (
  <div className="section-block-content-item">
    <span className="section-block-content-item-title">
      {string.settings.signature}
    </span>
    <div className="signature-switch">
      <div className="settings-switch">
        <Switch
          theme="two"
          name="setPasswordSwitch"
          onChange={props.onChangeRadioButtonSignature}
          checked={!!myAccount.signatureEnabled}
        />
      </div>
      <div className="settings-switch-label">
        <span>
          {`${string.settings.signature} ${
            myAccount.signatureEnabled
              ? string.settings.enabled
              : string.settings.disabled
          }`}
        </span>
      </div>
    </div>
    <div
      className={`signature-editor ${
        !myAccount.signatureEnabled ? 'signature-editor-disabled' : ''
      }`}
    >
      <Editor
        toolbar={{
          options: [
            'inline',
            'fontSize',
            'fontFamily',
            'colorPicker',
            'link',
            'emoji'
          ],
          inline: {
            options: ['bold', 'italic', 'underline']
          },
          textAlign: { inDropdown: true },
          link: {
            inDropdown: false,
            defaultTargetOption: '_blank'
          },
          history: { inDropdown: true }
        }}
        editorState={props.signature}
        onEditorStateChange={ev => props.onChangeTextareaSignature(ev)}
      />
    </div>
  </div>
);

const Loading = () => (
  <div className="loading-ring">
    <div />
    <div />
    <div />
    <div />
  </div>
);

renderBlockEmail.propTypes = {
  avatarIsLoading: PropTypes.bool,
  avatarUrl: PropTypes.string,
  onChangeAvatar: PropTypes.func,
  onErrorAvatar: PropTypes.func,
  showAvatar: PropTypes.bool
};

renderBlockName.propTypes = {
  mode: PropTypes.string,
  name: PropTypes.string,
  onAddNameInputKeyPressed: PropTypes.func,
  onBlurInputName: PropTypes.func,
  onChangeInputName: PropTypes.func,
  onClickEditName: PropTypes.func
};

renderBlockSignature.propTypes = {
  onChangeRadioButtonSignature: PropTypes.func,
  onChangeTextareaSignature: PropTypes.func,
  signature: PropTypes.string
};

export default SettingsGeneralProfile;
