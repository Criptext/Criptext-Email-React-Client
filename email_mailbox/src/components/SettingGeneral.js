/* eslint react/jsx-no-target-blank: 0 */
import React from 'react';
import PropTypes from 'prop-types';
import { RadioLab, RadioButton } from 'react-radio-lab';
import { myAccount } from './../utils/electronInterface';
import { getTwoCapitalLetters } from './../utils/StringUtils';
import { appDomain } from '../utils/const';
import { usefulLinks } from '../utils/const';
import './settinggeneral.css';

const SettingGeneral = props => (
  <div>
    {renderProfileBlock(props)}
    {renderPasswordBlock(props)}
    {renderLogoutAccountBlock(props)}
    {renderLanguageBlock()}
    {renderUsefulLinksBlock()}
  </div>
);

const styles = {
  inline: {
    margin: '0px',
    padding: '0px',
    width: '100px'
  },
  button: {
    innerCircle: {
      r: 4,
      fill: '#0091ff'
    },
    outerCircle: {
      r: 7,
      stroke: '#0091ff',
      strokeWidth: 1
    },
    label: {
      color: '#6c7280',
      fontSize: 14,
      fontFamily: 'NunitoSans',
      bottom: 4
    }
  },
  container: {
    paddingTop: 0,
    cursor: 'pointer',
    height: '50%'
  }
};

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
  <div className="section-block-content-item content-name">
    <p>Name</p>
    <input
      className="profile-name"
      value={props.name}
      onChange={ev => props.onChangeInputName(ev)}
    />
  </div>
);

const renderBlockSignature = props => (
  <div className="section-block-content-item content-signature">
    <p>Signature</p>
    <RadioLab
      onChange={ev => props.onChangeRadioButtonSignature(ev)}
      init={!!myAccount.signatureEnabled}
    >
      <div className="signature-radio-button" style={styles}>
        <RadioButton value={false} style={styles.button}>
          No signature
        </RadioButton>
      </div>
      <div className="signature-radio-button" style={styles}>
        <RadioButton value={true} style={styles.button}>
          Enable signature
        </RadioButton>
      </div>
    </RadioLab>
    <textarea
      className="signature-textarea"
      value={props.signature || ''}
      onChange={ev => props.onChangeTextareaSignature(ev)}
      disabled={!myAccount.signatureEnabled}
      rows={7}
    />
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
  name: PropTypes.string,
  onChangeInputName: PropTypes.func
};

renderBlockSignature.propTypes = {
  onChangeRadioButtonSignature: PropTypes.func,
  onChangeTextareaSignature: PropTypes.func,
  signature: PropTypes.string
};

export default SettingGeneral;
