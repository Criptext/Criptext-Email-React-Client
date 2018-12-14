/* eslint react/jsx-no-target-blank: 0 */
import React from 'react';
import PropTypes from 'prop-types';
import { Switch } from 'react-switch-input';
import { Editor } from 'react-draft-wysiwyg';
import Countdown from 'react-countdown-now';
import PopupHOC from './PopupHOC';
import { EDITING_MODES, SETTINGS_POPUP_TYPES } from './SettingGeneralWrapper';
import ChangePasswordPopup from './ChangePasswordPopup';
import ChangeRecoveryEmailPopup from './ChangeRecoveryEmailPopup';
import LogoutPopup from './LogoutPopup';
import TwoFactorAuthEnabledPopup from './TwoFactorAuthEnabledPopup';
import DeleteAccountPopupWrapper from './DeleteAccountPopupWrapper';
import { myAccount } from './../utils/electronInterface';
import { getTwoCapitalLetters } from './../utils/StringUtils';
import { appDomain, usefulLinks } from '../utils/const';
import { getResendConfirmationTimestamp } from '../utils/storage';
import string from './../lang';
import SettingsGeneralDeleteAccount from './SettingsGeneralDeleteAccount';
import SettingsGeneralLanguageWrapper from './SettingsGeneralLanguageWrapper';
import './settinggeneral.scss';
import './signatureeditor.scss';

const Changepasswordpopup = PopupHOC(ChangePasswordPopup);
const Changerecoveryemailpopup = PopupHOC(ChangeRecoveryEmailPopup);
const Logoutpopup = PopupHOC(LogoutPopup);
const Twofactorauthenabledpopup = PopupHOC(TwoFactorAuthEnabledPopup);
const Deleteaccountpopup = PopupHOC(DeleteAccountPopupWrapper);

const TWO_FACTOR_NOT_AVAILABLE_TEXT =
  'To enable Two-Factor Authentication you must set and verify a recovery email';
const TWO_FACTOR_ENABLED_TEXT = string.settings.on;
const TWO_FACTOR_DISABLED_TEXT = string.settings.off;
const READ_RECEIPTS_LABEL_TEXT =
  "If you turn off read receipts, you won't be able to see " +
  'read receipts from other people';

const SettingGeneral = props => (
  <div id="setting-general">
    <ProfileBlock {...props} />
    <PasswordBlock {...props} />
    <TwoFactorAuthenticationBlock {...props} />
    <ShowEmailPreviewBlock {...props} />
    <ReadReceiptsBlock {...props} />
    <RecoveryEmailBlock {...props} />
    <SettingsGeneralLanguageWrapper />
    <UsefulLinksBlock />
    <LogoutAccountBlock {...props} />
    <SettingsGeneralDeleteAccount
      onShowSettingsPopup={props.onShowSettingsPopup}
    />
    <SettingsPopup {...props} />
  </div>
);

const ProfileBlock = props => (
  <div className="section-block">
    <div className="section-block-title">
      <h1>{string.settings.profile}</h1>
    </div>
    <div className="section-block-content">
      {renderBlockEmail()}
      {renderBlockName(props)}
      {renderBlockSignature(props)}
    </div>
  </div>
);

const renderBlockEmail = () => (
  <div className="section-block-content-item">
    <div className="general-letters">
      <span>{getTwoCapitalLetters(myAccount.name)}</span>
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
      <div className="signature-switch-item custom-switch">
        <Switch
          theme="two"
          name="setPasswordSwitch"
          onChange={props.onChangeRadioButtonSignature}
          checked={!!myAccount.signatureEnabled}
        />
      </div>
      <div className="signature-switch-label">
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

const PasswordBlock = props => (
  <div className="section-block">
    <div className="section-block-title">
      <h1>{string.settings.password}</h1>
    </div>
    <div className="section-block-content">
      <div className="section-block-content-item">
        <button
          className="button-a button-reset-password"
          onClick={props.onClickChangePasswordButton}
        >
          <span>{string.settings.change_password}</span>
        </button>
      </div>
    </div>
  </div>
);

const LogoutAccountBlock = props => (
  <div className="section-block">
    <div className="section-block-title">
      <h1>Logout Account</h1>
    </div>
    <div className="section-block-content">
      <div className="section-block-content-item">
        <div className="logout-button" onClick={() => props.onClickLogout()}>
          <i className="icon-log-out" />
          <span>Logout</span>
        </div>
      </div>
    </div>
  </div>
);

const RecoveryEmailBlock = props => (
  <div className="section-block">
    <div className="section-block-title">
      <h1>Recovery Email</h1>
    </div>
    <div className="section-block-content">
      <div className="section-block-content-item content-recovery-email">
        <div className="recovery-email">
          {props.recoveryEmailIsLoading ? (
            <RecoveryEmailLoading />
          ) : (
            <div>
              <span className="address">
                {props.recoveryEmail || 'Recovery email not configured'}
              </span>
              {!props.recoveryEmail && (
                <button
                  className="button-b"
                  onClick={() => props.onClickChangeRecoveryEmail()}
                >
                  <span>Set Email</span>
                </button>
              )}
              {props.recoveryEmail && (
                <div>
                  <RecoveryEmailConfirmationMessage
                    recoveryEmailConfirmed={props.recoveryEmailConfirmed}
                  />
                  <button
                    className="button-b"
                    onClick={() => props.onClickChangeRecoveryEmail()}
                  >
                    <span>Change</span>
                  </button>
                  {!props.recoveryEmailConfirmed && (
                    <ResendConfirmationRecoveryEmailLink {...props} />
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  </div>
);

const RecoveryEmailLoading = () => (
  <div className="loading-ring">
    <div />
    <div />
    <div />
    <div />
  </div>
);

const TwoFactorAuthenticationBlock = props => (
  <div className="section-block">
    <div className="section-block-title">
      <h1>{string.settings.two_factor_authentication}</h1>
    </div>
    <div className="section-block-content">
      <div className="section-block-content-item">
        <div className="two-factor-switch">
          <div className="two-factor-switch-item custom-switch">
            <Switch
              theme="two"
              name="setTwoFactorSwitch"
              onChange={props.onChangeSwitchTwoFactor}
              checked={!!props.twoFactorEnabled}
              disabled={
                !props.recoveryEmail ||
                !props.recoveryEmailConfirmed ||
                props.twoFactorLabelIsLoading
              }
            />
          </div>
          <div className="two-factor-switch-label">
            {props.twoFactorLabelIsLoading ? (
              <TwoFactorLoadingLabel />
            ) : (
              renderTwoFactorTextLabel(props)
            )}
          </div>
        </div>
      </div>
    </div>
  </div>
);

const TwoFactorLoadingLabel = () => (
  <div className="loading-ring">
    <div />
    <div />
    <div />
    <div />
  </div>
);

const renderTwoFactorTextLabel = props => {
  const hasRecoveryEmailConnfirmed =
    props.recoveryEmail && props.recoveryEmailConfirmed;
  const isEnabled = props.twoFactorEnabled;
  const textLabel = !hasRecoveryEmailConnfirmed
    ? TWO_FACTOR_NOT_AVAILABLE_TEXT
    : isEnabled
      ? TWO_FACTOR_ENABLED_TEXT
      : TWO_FACTOR_DISABLED_TEXT;
  const labelClass = !hasRecoveryEmailConnfirmed
    ? 'two-factor-warning-label'
    : 'two-factor-normal-label';
  return <span className={labelClass}>{textLabel}</span>;
};

const ShowEmailPreviewBlock = props => (
  <div className="section-block">
    <div className="section-block-title">
      <h1>{string.settings.notification_preview}</h1>
    </div>
    <div className="section-block-content">
      <div className="section-block-content-item">
        <div className="email-preview-switch">
          <div className="email-preview-switch-item custom-switch">
            <Switch
              theme="two"
              name="setEmailPreviewSwitch"
              onChange={props.onChangeSwitchEmailPreview}
              checked={!!props.emailPreviewEnabled}
            />
          </div>
          <div className="email-preview-switch-label">
            <span>{props.emailPreviewEnabled ? 'On' : 'Off'}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const ReadReceiptsBlock = props => (
  <div className="section-block">
    <div className="section-block-title">
      <h1>{string.settings.read_receipts}</h1>
    </div>
    <div className="section-block-content">
      <div className="section-block-content-item">
        <div className="read-receipts-switch">
          <div className="read-receipts-switch-item custom-switch">
            <Switch
              theme="two"
              name="setReadReceiptsSwitch"
              onChange={props.onChangeSwitchReadReceipts}
              checked={!!props.readReceiptsEnabled}
              disabled={props.readReceiptsLabelisLoading}
            />
          </div>
          <div className="read-receipts-switch-label">
            {props.readReceiptsLabelisLoading ? (
              <ReadReceiptsLoadingLabel />
            ) : (
              <span>{READ_RECEIPTS_LABEL_TEXT}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  </div>
);

const ReadReceiptsLoadingLabel = () => (
  <div className="loading-ring">
    <div />
    <div />
    <div />
    <div />
  </div>
);

const ResendConfirmationRecoveryEmailLink = ({
  onClickResendConfirmationLink,
  onResendConfirmationCountdownEnd
}) => {
  return (
    <Countdown
      date={getResendConfirmationTimestamp()}
      renderer={renderer}
      onComplete={onResendConfirmationCountdownEnd}
    >
      <button className="button-b" onClick={onClickResendConfirmationLink}>
        <span>{string.settings.resend_link}</span>
      </button>
    </Countdown>
  );
};

const renderer = ({ minutes, seconds, completed, children }) => {
  if (completed || minutes === 'NaN' || seconds === 'NaN') {
    return children;
  }
  return (
    <button className="button-b" disabled={true}>
      <span>{`Resend Link available within ${minutes}:${seconds}`}</span>
    </button>
  );
};

const RecoveryEmailConfirmationMessage = ({ recoveryEmailConfirmed }) => {
  return recoveryEmailConfirmed ? (
    <div className="recovery-email-confirmation-section recovery-email-confirmed">
      <i className="icon-correct" />
      <span className="text">Verified</span>
    </div>
  ) : (
    <div className="recovery-email-confirmation-section recovery-email-not-confirmed">
      <i className="icon-incorret" />
      <span className="text">Not verified</span>
    </div>
  );
};

const UsefulLinksBlock = () => (
  <div className="section-block">
    <div className="section-block-title">
      <h1>Useful Links</h1>
    </div>
    <div className="section-block-content">
      <div className="section-block-content-item">
        <a className="useful-link" href={usefulLinks.FAQ} target="_blank">
          FAQ
        </a>
        <a
          className="useful-link"
          href={usefulLinks.PRIVACY_POLICY}
          target="_blank"
        >
          Privacy Policy
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

const SettingsPopup = props => {
  const type = props.settingsPupopType;
  const isHidden = props.isHiddenSettingsPopup;
  switch (type) {
    case SETTINGS_POPUP_TYPES.CHANGE_PASSWORD: {
      return (
        <Changepasswordpopup
          isHidden={isHidden}
          onTogglePopup={props.onClickCancelChangePassword}
          popupPosition={{ left: '45%', top: '45%' }}
          theme={'dark'}
          {...props}
        />
      );
    }
    case SETTINGS_POPUP_TYPES.CHANGE_RECOVERY_EMAIL: {
      return (
        <Changerecoveryemailpopup
          isHidden={isHidden}
          onTogglePopup={props.onClickCancelChangeRecoveryEmail}
          popupPosition={{ left: '45%', top: '45%' }}
          theme={'dark'}
          {...props}
        />
      );
    }
    case SETTINGS_POPUP_TYPES.LOGOUT: {
      return (
        <Logoutpopup
          isHidden={isHidden}
          onTogglePopup={props.onClickCancelChangePassword}
          popupPosition={{ left: '45%', top: '45%' }}
          theme={'dark'}
          {...props}
        />
      );
    }
    case SETTINGS_POPUP_TYPES.TWO_FACTOR_AUTH_ENABLED: {
      return (
        <Twofactorauthenabledpopup
          isHidden={isHidden}
          onTogglePopup={props.onClickCloseTwoFactorEnabledPopup}
          popupPosition={{ left: '45%', top: '45%' }}
          theme={'dark'}
          {...props}
        />
      );
    }
    case SETTINGS_POPUP_TYPES.DELETE_ACCOUNT: {
      return (
        <Deleteaccountpopup
          isHidden={isHidden}
          onTogglePopup={props.onHideSettingsPopup}
          popupPosition={{ left: '45%', top: '45%' }}
          theme={'dark'}
          {...props}
        />
      );
    }
    default:
      return null;
  }
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

PasswordBlock.propTypes = {
  onClickChangePasswordButton: PropTypes.func
};

SettingsPopup.propTypes = {
  isHiddenSettingsPopup: PropTypes.bool,
  settingsPupopType: PropTypes.string,
  onClickCancelChangePassword: PropTypes.func,
  onClickCancelChangeRecoveryEmail: PropTypes.func
};

LogoutAccountBlock.propTypes = {
  onClickLogout: PropTypes.func
};

RecoveryEmailBlock.propTypes = {
  isDisabledResendConfirmationLink: PropTypes.bool,
  mode: PropTypes.string,
  onAddRecoveryEmailInputKeyPressed: PropTypes.func,
  onBlurInputRecoveryEmail: PropTypes.func,
  onChangeInputRecoveryEmail: PropTypes.func,
  onClickChangeRecoveryEmail: PropTypes.func,
  onClickEditRecoveryEmail: PropTypes.func,
  recoveryEmail: PropTypes.string,
  recoveryEmailConfirmed: PropTypes.bool,
  recoveryEmailIsLoading: PropTypes.bool,
  resendLinkText: PropTypes.string
};

TwoFactorAuthenticationBlock.propTypes = {
  onChangeSwitchTwoFactor: PropTypes.func,
  recoveryEmail: PropTypes.string,
  recoveryEmailConfirmed: PropTypes.bool,
  twoFactorEnabled: PropTypes.bool,
  twoFactorLabelIsLoading: PropTypes.bool
};

renderTwoFactorTextLabel.propTypes = {
  recoveryEmail: PropTypes.string,
  recoveryEmailConfirmed: PropTypes.bool,
  twoFactorEnabled: PropTypes.bool
};

ShowEmailPreviewBlock.propTypes = {
  emailPreviewEnabled: PropTypes.bool,
  onChangeSwitchEmailPreview: PropTypes.func
};

ReadReceiptsBlock.propTypes = {
  onChangeSwitchReadReceipts: PropTypes.func,
  readReceiptsEnabled: PropTypes.bool,
  readReceiptsLabelisLoading: PropTypes.bool
};

ResendConfirmationRecoveryEmailLink.propTypes = {
  isDisabledResend: PropTypes.bool,
  onClickResendConfirmationLink: PropTypes.func,
  onResendConfirmationCountdownEnd: PropTypes.func,
  resendCountdown: PropTypes.string
};

renderer.propTypes = {
  completed: PropTypes.string,
  children: PropTypes.object,
  minutes: PropTypes.string,
  seconds: PropTypes.string
};

RecoveryEmailConfirmationMessage.propTypes = {
  recoveryEmailConfirmed: PropTypes.bool
};

SettingGeneral.propTypes = {
  onShowSettingsPopup: PropTypes.func
};

export default SettingGeneral;
