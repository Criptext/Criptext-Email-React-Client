import React from 'react';
import { myAccount } from './../utils/electronInterface';
import { getTwoCapitalLetters } from './../utils/StringUtils';
import { appDomain } from '../utils/const';
import './settinggeneral.css';

const SettingGeneral = () => (
  <div>
    <div className="section-block">
      <div className="section-block-title">
        <h1>Profile</h1>
      </div>
      <div className="section-block-content">
        <div className="general-letters">
          <span>{getTwoCapitalLetters(myAccount.name)}</span>
        </div>
        <label>{`${myAccount.recipientId}@${appDomain}`}</label>
      </div>
    </div>
    <div className="section-block">
      <div className="section-block-title">
        <h1>Password</h1>
      </div>
      <div className="section-block-content" />
    </div>
  </div>
);

export default SettingGeneral;
