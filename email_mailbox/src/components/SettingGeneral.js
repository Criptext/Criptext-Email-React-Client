/* eslint react/jsx-no-target-blank: 0 */
import React from 'react';
import PropTypes from 'prop-types';
import Switch from 'react-switch';
import { Editor } from 'react-draft-wysiwyg';
import { myAccount } from './../utils/electronInterface';
import { getTwoCapitalLetters } from './../utils/StringUtils';
import { appDomain } from '../utils/const';
import { usefulLinks } from '../utils/const';
import { inputNameModes } from './SettingGeneralWrapper';
import './settinggeneral.css';
import './signatureeditor.css';

const SettingGeneral = props => (
  <div>
    {renderProfileBlock(props)}
    {renderPasswordBlock(props)}
    {renderLogoutAccountBlock(props)}
    {renderLanguageBlock()}
    {renderUsefulLinksBlock()}
  </div>
);

const renderProfileBlock = props => (
  <div className="section-block">
    <div className="section-block-title">
      <h1>Profile</h1>
    </div>
    <div className="section-block-content">
      {renderBlockEmail()}
      {renderBlockName(props)}
      {renderBlockSignature(props)}
    </div>
  </div>
);

const renderBlockEmail = () => (
  <div className="section-block-content-item content-email">
    <div className="general-letters">
      <span>{getTwoCapitalLetters(myAccount.name)}</span>
    </div>
    <label>{`${myAccount.recipientId}@${appDomain}`}</label>
  </div>
);

const renderBlockName = props => (
  <div
    className="section-block-content-item content-name"
    onBlur={props.onBlurInputName}
  >
    <p>Name</p>
    {props.mode === inputNameModes.EDITING ? (
      <div>
        <input
          type="text"
          placeholder="Enter new name"
          value={props.name}
          onChange={ev => props.onChangeInputName(ev)}
          onKeyPress={props.onAddNameInputKeyPressed}
          autoFocus={true}
        />
        <span
          className="cancel-edit-inputname-label"
          onClick={props.onBlurInputName}
        >
          Cancel
        </span>
      </div>
    ) : (
      <div className="profile-name">
        <span onDoubleClick={props.onClickEditName}>{myAccount.name}</span>
        <i
          className="icon-edit"
          title="Edit name"
          onClick={props.onClickEditName}
        />
      </div>
    )}
  </div>
);

const renderBlockSignature = props => (
  <div className="section-block-content-item content-signature">
    <p>Signature</p>
    <div className="signature-switch">
      <div className="signature-switch-item">
        <Switch
          id="setPasswordSwitch"
          onChange={ev => props.onChangeRadioButtonSignature(ev)}
          checked={!!myAccount.signatureEnabled}
          width={28}
          height={17}
          handleDiameter={13}
          offColor="#b4b4b4"
          onColor="#0091ff"
          uncheckedIcon={false}
          checkedIcon={false}
        />
      </div>
      <div className="signature-switch-label">
        <span>
          {`Signature ${myAccount.signatureEnabled ? 'enabled' : 'disabled'}`}
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

const renderPasswordBlock = () => (
  <div className="section-block">
    <div className="section-block-title">
      <h1>Password</h1>
    </div>
    <div className="section-block-content">
      <div className="section-block-content-item content-reset-password">
        <button className="button button-a button-reset-password">
          <span>Reset password</span>
        </button>
      </div>
    </div>
  </div>
);

const renderLogoutAccountBlock = () => (
  <div className="section-block">
    <div className="section-block-title">
      <h1>Logout Account</h1>
    </div>
    <div className="section-block-content">
      <div className="section-block-content-item content-logout-account">
        <i className="icon-exit" />
        <span>Logout</span>
      </div>
    </div>
  </div>
);

const renderLanguageBlock = () => (
  <div className="section-block">
    <div className="section-block-title">
      <h1>Language</h1>
    </div>
    <div className="section-block-content">
      <div className="section-block-content-item content-language">
        <span>English (US)</span>
      </div>
    </div>
  </div>
);

const renderUsefulLinksBlock = () => (
  <div className="section-block">
    <div className="section-block-title">
      <h1>Useful Links</h1>
    </div>
    <div className="section-block-content">
      <div className="section-block-content-item content-useful-links">
        <a className="useful-link" href={usefulLinks.FAQ} target="_blank">
          FAQ
        </a>
        <a
          className="useful-link"
          href={usefulLinks.PRIVACY_POLICIES}
          target="_blank"
        >
          Privacy Policies
        </a>
        <a
          className="useful-link"
          href={usefulLinks.TERMS_OF_SERVICE}
          target="_blank"
        >
          Terms of service
        </a>
        <a
          className="useful-link"
          href={usefulLinks.CRIPTEXT_LIBRARIES}
          target="_blank"
        >
          Criptext Libraries
        </a>
      </div>
    </div>
  </div>
);

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

export default SettingGeneral;
