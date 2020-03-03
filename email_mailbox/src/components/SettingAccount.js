/* eslint react/jsx-no-target-blank: 0 */
import React from 'react';
import PropTypes from 'prop-types';
import { Switch } from 'react-switch-input';
import Countdown from 'react-countdown-now';
import SettingBlockReplyTo from './SettingBlockReplyTo';
import SettingsPopup from './SettingsPopup';
import SettingBlockDeleteAccount from './SettingBlockDeleteAccount';
import SettingBlockManualSync from './SettingBlockManualSync';
import SettingBlockProfile from '../containers/SettingBlockProfile';
import SettingsAccountBackupWrapper from './SettingsAccountBackupWrapper';
import SettingsAccountRestoreBackupc from './SettingsAccountRestoreBackup';
import { getResendConfirmationTimestamp } from '../utils/storage';
import string from './../lang';
import './settingaccount.scss';
import './signatureeditor.scss';

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
        <SettingBlockProfile {...props} />
      </div>
      <div className="cptx-section-block-title">
        <h1>{string.settings.addresses}</h1>
      </div>
      <div className="cptx-section-block-content">
        <CustomDomainsBlock {...props} />
        <AliasesBlock {...props} />
      </div>
      <div className="cptx-section-block-title">
        <h1>{string.settings.privacy}</h1>
      </div>
      <div className="cptx-section-block-content">
        <ReadReceiptsBlock {...props} />
        <TwoFactorAuthenticationBlock {...props} />
        <SecurityPin {...props} />
      </div>
      <div className="cptx-section-block-title">
        <h1>{string.settings.configurations}</h1>
      </div>
      <div className="cptx-section-block-content">
        <PasswordBlock {...props} />
        <RecoveryEmailBlock {...props} />
        <SettingBlockReplyTo {...props} />
        <SettingsAccountBackupWrapper {...props} />
        <SettingsAccountRestoreBackupc />
        <SettingBlockManualSync
          onShowSettingsPopup={props.onShowSettingsPopup}
          devicesQuantity={props.devicesQuantity}
        />
        {!props.isEnterprise && (
          <SettingBlockDeleteAccount
            onShowSettingsPopup={props.onShowSettingsPopup}
          />
        )}
      </div>
    </div>
    <SettingsPopup
      changePasswordPopupParams={props.changePasswordPopupParams}
      changeRecoveryEmailPopupParams={props.changeRecoveryEmailPopupParams}
      isHidden={props.isHiddenSettingsPopup}
      onChangeInputValueChangePassword={props.onChangeInputValueChangePassword}
      onChangeInputValueOnChangeRecoveryEmailPopup={
        props.onChangeInputValueOnChangeRecoveryEmailPopup
      }
      onChangeInputValueOnSetReplyTo={props.onChangeInputValueOnSetReplyTo}
      onClearPopupParams={props.onClearPopupParams}
      onClickChangeRecoveryEmailInputType={
        props.onClickChangeRecoveryEmailInputType
      }
      onClickChangePasswordInputType={props.onClickChangePasswordInputType}
      onClickForgotPasswordLink={props.onClickForgotPasswordLink}
      onClosePopup={props.onClosePopup}
      onConfirmChangePassword={props.onConfirmChangePassword}
      onConfirmChangeRecoveryEmail={props.onConfirmChangeRecoveryEmail}
      onConfirmSetReplyTo={props.onConfirmSetReplyTo}
      onShowSettingsPopup={props.onShowSettingsPopup}
      setReplyToPopupParams={props.setReplyToPopupParams}
      onSetExportBackupPassword={props.onSetExportBackupPassword}
      onSelectBackupFolder={props.onSelectBackupFolder}
      type={props.settingsPopupType}
    />
  </div>
);

const CustomDomainsBlock = props => (
  <div id="settings-account-domains" className="cptx-section-item">
    <span className="cptx-section-item-title">
      {string.settings.custom_domains.title}
    </span>
    <span className="cptx-section-item-description">
      {string.settings.custom_domains.description}
    </span>
    <div className="cptx-section-item-control">
      <button
        className="button-b"
        onClick={() => {
          props.onChangePanel('custom-domains');
        }}
      >
        <span>{string.settings.custom_domains.add}</span>
      </button>
    </div>
  </div>
);

const AliasesBlock = props => (
  <div id="settings-account-domains" className="cptx-section-item">
    <span className="cptx-section-item-title">
      {string.settings.aliases.title}
    </span>
    <span className="cptx-section-item-description">
      {string.settings.aliases.description}
    </span>
    <div className="cptx-section-item-control">
      <button
        className="button-b"
        onClick={() => {
          props.onChangePanel('alias');
        }}
      >
        <span>{string.settings.aliases.add}</span>
      </button>
    </div>
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

const SecurityPin = props => (
  <div className="cptx-section-item">
    <span className="cptx-section-item-title">
      {string.settings.security_pin.label}
    </span>
    <span className="cptx-section-item-description">
      {string.settings.security_pin.description}
    </span>
    <div className="cptx-section-item-control">
      <button className="button-b" onClick={props.onClickChangeSecurityPin}>
        <span>{string.settings.change}</span>
      </button>
    </div>
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

AliasesBlock.propTypes = {
  onChangePanel: PropTypes.func
};

CustomDomainsBlock.propTypes = {
  onChangePanel: PropTypes.func
};

PasswordBlock.propTypes = {
  onClickChangePasswordButton: PropTypes.func
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

SecurityPin.propTypes = {
  onClickChangeSecurityPin: PropTypes.func
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
  changePasswordPopupParams: PropTypes.object,
  changeRecoveryEmailPopupParams: PropTypes.object,
  devicesQuantity: PropTypes.number,
  isEnterprise: PropTypes.bool,
  isHiddenSettingsPopup: PropTypes.bool,
  onChangeInputValueChangePassword: PropTypes.func,
  onChangeInputValueOnChangeRecoveryEmailPopup: PropTypes.func,
  onChangeInputValueOnSetReplyTo: PropTypes.func,
  onClearPopupParams: PropTypes.func,
  onClickChangeRecoveryEmailInputType: PropTypes.func,
  onClickChangePasswordInputType: PropTypes.func,
  onClickForgotPasswordLink: PropTypes.func,
  onClosePopup: PropTypes.func,
  onConfirmChangePassword: PropTypes.func,
  onConfirmChangeRecoveryEmail: PropTypes.func,
  onConfirmSetReplyTo: PropTypes.func,
  onSelectBackupFolder: PropTypes.func,
  onSetExportBackupPassword: PropTypes.func,
  onShowSettingsPopup: PropTypes.func,
  setReplyToPopupParams: PropTypes.object,
  settingsPopupType: PropTypes.string
};

export default SettingAccount;
