/* eslint react/jsx-no-target-blank: 0 */
import React from 'react';
import PropTypes from 'prop-types';
import { Switch } from 'react-switch-input';
import Countdown from 'react-countdown-now';
import PopupHOC from './PopupHOC';
import { SETTINGS_POPUP_TYPES } from './SettingAccountWrapper';
import ChangePasswordPopup from './ChangePasswordPopup';
import ChangeRecoveryEmailPopup from './ChangeRecoveryEmailPopup';
import SetReplyToEmailPopup from './SetReplyToEmailPopup';
import LogoutPopup from './LogoutPopup';
import TwoFactorAuthEnabledPopup from './TwoFactorAuthEnabledPopup';
import DeleteAccountPopupWrapper from './DeleteAccountPopupWrapper';
import SettingBlockReplyTo from './SettingBlockReplyTo';
import SettingBlockDeleteAccount from './SettingBlockDeleteAccount';
import SettingsGeneralLanguageWrapper from './SettingsGeneralLanguageWrapper';
import SettingsGeneralThemeWrapper from './SettingsGeneralThemeWrapper';
import SettingBlockManualSync from './SettingBlockManualSync';
import ManualSyncPopup from './ManualSyncPopup';
import ManualSyncProcessPopup from './ManualSyncProcessPopup';
import SettingsGeneralProfile from '../containers/SettingsGeneralProfile';
import { getResendConfirmationTimestamp } from '../utils/storage';
import { usefulLinks } from '../utils/const';
import string from './../lang';
import './settingaccount.scss';
import './signatureeditor.scss';

const Changepasswordpopup = PopupHOC(ChangePasswordPopup);
const Changerecoveryemailpopup = PopupHOC(ChangeRecoveryEmailPopup);
const Logoutpopup = PopupHOC(LogoutPopup);
const Twofactorauthenabledpopup = PopupHOC(TwoFactorAuthEnabledPopup);
const Deleteaccountpopup = PopupHOC(DeleteAccountPopupWrapper);
const Manualsyncpopup = PopupHOC(ManualSyncPopup);
const Manualsyncprocesspopup = PopupHOC(ManualSyncProcessPopup);
const SetReplyTo = PopupHOC(SetReplyToEmailPopup);

const TWO_FACTOR_NOT_AVAILABLE_TEXT =
  string.settings.two_factor_not_available_text;
const TWO_FACTOR_ENABLED_TEXT = string.settings.on;
const TWO_FACTOR_DISABLED_TEXT = string.settings.off;

const SettingAccount = props => (
  <div id="setting-account">
    <div className="cptx-section-block">
      <div className="cptx-section-block-title">
        <h1>{string.settings.profile}</h1>
      </div>
      <div className="cptx-section-block-content">
        <SettingsGeneralProfile {...props} />
      </div>
      <div className="cptx-section-block-title">
        <h1>{string.settings.privacy}</h1>
      </div>
      <div className="cptx-section-block-content">
        <ReadReceiptsBlock {...props} />
        <TwoFactorAuthenticationBlock {...props} />
      </div>
      <div className="cptx-section-block-title">
        <h1>{string.settings.configurations}</h1>
      </div>
      <div className="cptx-section-block-content">
        <PasswordBlock {...props} />
        <RecoveryEmailBlock {...props} />
        <SettingBlockReplyTo {...props} />
        <SettingBlockManualSync
          onShowSettingsPopup={props.onShowSettingsPopup}
          devicesQuantity={props.devicesQuantity}
        />
        <SettingBlockDeleteAccount
          onShowSettingsPopup={props.onShowSettingsPopup}
        />
        <ShowEmailPreviewBlock {...props} />
        <SettingsGeneralLanguageWrapper />
        <SettingsGeneralThemeWrapper />
        <UsefulLinksBlock />
      </div>
    </div>
    <SettingsPopup {...props} />
  </div>
);

const PasswordBlock = props => (
  <div id="settings-general-password" className="cptx-section-item">
    <span className="cptx-section-item-title">
      {string.settings.password.label}
    </span>
    <span className="cptx-section-item-description">
      {string.settings.password.description}
    </span>
    <div className="cptx-section-item-control">
      <button className="button-b" onClick={props.onClickChangePasswordButton}>
        <span>{string.settings.change}</span>
      </button>
    </div>
  </div>
);

const RecoveryEmailBlock = props => (
  <div id="settings-general-recovery-email" className="cptx-section-item">
    <span className="cptx-section-item-title">
      {string.settings.recovery_email.label}
    </span>
    <span className="cptx-section-item-description">
      {string.settings.recovery_email.description}
    </span>
    <div className="cptx-section-item-control">
      <button
        className="button-b"
        onClick={() => props.onClickChangeRecoveryEmail()}
      >
        <span>
          {!props.recoveryEmail
            ? string.settings.set_email
            : string.settings.change}
        </span>
      </button>
      {props.recoveryEmail &&
        !props.recoveryEmailConfirmed && (
          <ResendConfirmationRecoveryEmailLink {...props} />
        )}
    </div>
    <div className="cptx-section-item-block">
      {props.recoveryEmail && (
        <RecoveryEmailConfirmationMessage
          recoveryEmail={props.recoveryEmail}
          recoveryEmailConfirmed={props.recoveryEmailConfirmed}
          recoveryEmailIsLoading={props.recoveryEmailIsLoading}
        />
      )}
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
  <div id="settings-general-two-factor" className="cptx-section-item">
    <span className="cptx-section-item-title">
      {string.settings.two_factor_authentication}
    </span>
    <span className="cptx-section-item-description">
      {renderTwoFactorTextLabel(props)}
    </span>
    <div className="cptx-section-item-control">
      {props.twoFactorLabelIsLoading ? (
        <TwoFactorLoadingLabel />
      ) : (
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
      )}
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
  return textLabel;
};

const ShowEmailPreviewBlock = props => (
  <div id="settings-general-email-preview" className="cptx-section-item">
    <span className="cptx-section-item-title">
      {string.settings.notification_preview.label}
    </span>
    <span className="cptx-section-item-description">
      {string.settings.notification_preview.description}
    </span>
    <div className="cptx-section-item-control">
      <Switch
        theme="two"
        name="setEmailPreviewSwitch"
        onChange={props.onChangeSwitchEmailPreview}
        checked={!!props.emailPreviewEnabled}
      />
    </div>
  </div>
);

const ReadReceiptsBlock = props => (
  <div id="settings-general-read-receipts" className="cptx-section-item">
    <span className="cptx-section-item-title">
      {string.settings.read_receipts}
    </span>
    <span className="cptx-section-item-description">
      {string.settings.read_receipts_description}
    </span>
    <div className="cptx-section-item-control">
      {props.readReceiptsLabelisLoading ? (
        <ReadReceiptsLoadingLabel />
      ) : (
        <Switch
          theme="two"
          name="setReadReceiptsSwitch"
          onChange={props.onChangeSwitchReadReceipts}
          checked={!!props.readReceiptsEnabled}
          disabled={props.readReceiptsLabelisLoading}
        />
      )}
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

const RecoveryEmailConfirmationMessage = ({
  recoveryEmail,
  recoveryEmailConfirmed,
  recoveryEmailIsLoading
}) => {
  return (
    <div
      className={`cptx-recovery-email ${
        recoveryEmailConfirmed
          ? 'cptx-recovery-email-confirmed'
          : 'cptx-recovery-email-not-confirmed'
      }`}
    >
      <div className="cptx-recovery-email-address">
        {recoveryEmailIsLoading ? (
          <RecoveryEmailLoading />
        ) : (
          <span>{recoveryEmail || string.settings.recovery_not_set}</span>
        )}
      </div>
      <div className="cptx-recovery-email-status">
        <span>
          {recoveryEmailConfirmed
            ? string.settings.verified
            : string.settings.not_verified}
        </span>
      </div>
    </div>
  );
};

const UsefulLinksBlock = () => (
  <div id="settings-general-usefullinks">
    <div className="cptx-section-item">
      <span className="cptx-section-item-title">
        {string.settings.faq.label}
      </span>
      <span className="cptx-section-item-description">
        {string.settings.faq.description}
      </span>
      <div className="cptx-section-item-control">
        <a className="cptx-useful-link" href={usefulLinks.FAQ} target="_blank">
          {string.settings.see_more}
        </a>
      </div>
    </div>
    <div className="cptx-section-item">
      <span className="cptx-section-item-title">
        {string.settings.privacy_policy.label}
      </span>
      <span className="cptx-section-item-description">
        {string.settings.privacy_policy.description}
      </span>
      <div className="cptx-section-item-control">
        <a
          className="cptx-useful-link"
          href={usefulLinks.PRIVACY_POLICY}
          target="_blank"
        >
          {string.settings.see_more}
        </a>
      </div>
    </div>
    <div className="cptx-section-item">
      <span className="cptx-section-item-title">
        {string.settings.terms_of_service.label}
      </span>
      <span className="cptx-section-item-description">
        {string.settings.terms_of_service.description}
      </span>
      <div className="cptx-section-item-control">
        <a
          className="cptx-useful-link"
          href={usefulLinks.TERMS_OF_SERVICE}
          target="_blank"
        >
          {string.settings.see_more}
        </a>
      </div>
    </div>
    <div className="cptx-section-item">
      <span className="cptx-section-item-title">
        {string.settings.criptext_libraries.label}
      </span>
      <span className="cptx-section-item-description">
        {string.settings.criptext_libraries.description}
      </span>
      <div className="cptx-section-item-control">
        <a
          className="cptx-useful-link"
          href={usefulLinks.CRIPTEXT_LIBRARIES}
          target="_blank"
        >
          {string.settings.see_more}
        </a>
      </div>
    </div>
  </div>
);

const SettingsPopup = props => {
  const type = props.settingsPopupType;
  const isHidden = props.isHiddenSettingsPopup;
  const {
    CHANGE_PASSWORD,
    CHANGE_RECOVERY_EMAIL,
    DELETE_ACCOUNT,
    LOGOUT,
    MANUAL_SYNC,
    MANUAL_SYNC_DEVICE_AUTHENTICATION,
    SET_REPLY_TO,
    TWO_FACTOR_AUTH_ENABLED
  } = SETTINGS_POPUP_TYPES;

  switch (type) {
    case CHANGE_PASSWORD: {
      return (
        <Changepasswordpopup
          isHidden={isHidden}
          onTogglePopup={() => {
            props.onHideSettingsPopup();
            props.onClearPopupParams(CHANGE_PASSWORD);
          }}
          popupPosition={{ left: '45%', top: '45%' }}
          theme={'dark'}
          {...props}
        />
      );
    }
    case CHANGE_RECOVERY_EMAIL: {
      return (
        <Changerecoveryemailpopup
          isHidden={isHidden}
          onTogglePopup={() => {
            props.onHideSettingsPopup();
            props.onClearPopupParams(CHANGE_RECOVERY_EMAIL);
          }}
          popupPosition={{ left: '45%', top: '45%' }}
          theme={'dark'}
          {...props}
        />
      );
    }
    case LOGOUT: {
      return (
        <Logoutpopup
          isHidden={isHidden}
          onTogglePopup={props.onHideSettingsPopup}
          popupPosition={{ left: '45%', top: '45%' }}
          theme={'dark'}
          {...props}
        />
      );
    }
    case TWO_FACTOR_AUTH_ENABLED: {
      return (
        <Twofactorauthenabledpopup
          isHidden={isHidden}
          onTogglePopup={props.onHideSettingsPopup}
          popupPosition={{ left: '45%', top: '45%' }}
          theme={'dark'}
          {...props}
        />
      );
    }
    case DELETE_ACCOUNT: {
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
    case MANUAL_SYNC: {
      return (
        <Manualsyncpopup
          isHidden={isHidden}
          onTogglePopup={props.onHideSettingsPopup}
          popupPosition={{ left: '45%', top: '45%' }}
          theme={'dark'}
          {...props}
        />
      );
    }
    case MANUAL_SYNC_DEVICE_AUTHENTICATION: {
      return (
        <Manualsyncprocesspopup
          isHidden={isHidden}
          onTogglePopup={props.onHideSettingsPopup}
          popupPosition={{ left: '45%', top: '45%' }}
          isClosable={false}
          theme={'dark'}
          {...props}
        />
      );
    }
    case SET_REPLY_TO: {
      return (
        <SetReplyTo
          isHidden={isHidden}
          onTogglePopup={() => {
            props.onHideSettingsPopup();
            props.onClearPopupParams(SET_REPLY_TO);
          }}
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

PasswordBlock.propTypes = {
  onClickChangePasswordButton: PropTypes.func
};

SettingsPopup.propTypes = {
  isHiddenSettingsPopup: PropTypes.bool,
  settingsPupopType: PropTypes.string,
  onClickCancelChangePassword: PropTypes.func,
  onClickCancelChangeRecoveryEmail: PropTypes.func
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
  recoveryEmail: PropTypes.string,
  recoveryEmailConfirmed: PropTypes.bool,
  recoveryEmailIsLoading: PropTypes.bool
};

SettingAccount.propTypes = {
  devicesQuantity: PropTypes.number,
  onShowSettingsPopup: PropTypes.func
};

export default SettingAccount;
