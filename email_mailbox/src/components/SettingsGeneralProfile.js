import React from 'react';
import PropTypes from 'prop-types';
import { myAccount } from './../utils/electronInterface';
import { getTwoCapitalLetters } from './../utils/StringUtils';
import { appDomain } from '../utils/const';
import { Switch } from 'react-switch-input';
import { EDITING_MODES } from './SettingAccountWrapper';
import { Editor } from 'react-draft-wysiwyg';
import string from '../lang';
import './settingsgeneralprofile.scss';

const SettingsGeneralProfile = props => (
  <div id="cptx-settings-profile">
    {renderBlockAvatar(props)}
    {renderBlockEmail(props)}
    {renderBlockName(props)}
    {renderBlockSignature(props)}
  </div>
);

const renderBlockAvatar = props => (
  <div className="cptx-section-item">
    <div className="cptx-profile-avatar">
      {props.showAvatar ? (
        <img
          src={props.avatarUrl}
          onError={props.onErrorAvatar}
          alt="user avatar"
        />
      ) : (
        <div className="cptx-profile-avatar-letters">
          <span>{getTwoCapitalLetters(myAccount.name)}</span>
        </div>
      )}
      {props.avatarIsLoading && (
        <div className="cptx-profile-avatar-loading-overlay">
          <Loading />
        </div>
      )}
    </div>
    <button
      id="cptx-button-edit-avatar"
      className="button-b"
      disabled={props.avatarIsLoading}
    >
      <input
        type="file"
        name="fileAvatar"
        id="fileAvatar"
        accept="image/*"
        onChange={props.onChangeAvatar}
      />
      <label htmlFor={props.avatarIsLoading ? null : 'fileAvatar'}>
        {string.settings.edit}
      </label>
    </button>
    <button
      className="button-b"
      disabled={props.avatarIsLoading}
      onClick={
        props.avatarIsLoading || !props.showAvatar ? null : props.onRemoveAvatar
      }
    >
      <span>{string.settings.remove}</span>
    </button>
  </div>
);

const renderBlockEmail = () => {
  const username = myAccount.recipientId.includes('@')
    ? myAccount.recipientId
    : `${myAccount.recipientId}@${appDomain}`;
  return (
    <div className="cptx-section-item">
      <span className="cptx-section-item-title">{string.settings.email}</span>
      <span className="cptx-section-item-description">{username}</span>
    </div>
  );
};

const renderBlockName = props => (
  <div className="cptx-section-item" onBlur={props.onBlurInputName}>
    <span className="cptx-section-item-title">{string.settings.fullname}</span>
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
        <span
          className="cptx-section-item-description"
          onDoubleClick={props.onClickEditName}
        >
          {myAccount.name}
        </span>
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
  <div className="cptx-section-item">
    <span className="cptx-section-item-title">{string.settings.signature}</span>
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
        <span className="cptx-section-item-description">
          {`${string.settings.signature} ${
            myAccount.signatureEnabled
              ? string.settings.enabled
              : string.settings.disabled
          }`}
        </span>
      </div>
    </div>
    <div
      className={`cptx-signature-editor ${
        !myAccount.signatureEnabled ? 'cptx-signature-editor-disabled' : ''
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

renderBlockAvatar.propTypes = {
  avatarIsLoading: PropTypes.bool,
  avatarUrl: PropTypes.string,
  onChangeAvatar: PropTypes.func,
  onErrorAvatar: PropTypes.func,
  onRemoveAvatar: PropTypes.func,
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
