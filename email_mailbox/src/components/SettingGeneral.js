/* eslint react/jsx-no-target-blank: 0 */
import React from 'react';
import SettingsGeneralLanguageWrapper from './SettingsGeneralLanguageWrapper';
import SettingsGeneralThemeWrapper from './SettingsGeneralThemeWrapper';
import SettingsGeneralShowEmailPreviewWrapper from './SettingsGeneralShowEmailPreviewWrapper';
import { usefulLinks } from '../utils/const';
import string from './../lang';

const SettingGeneral = () => (
  <div id="setting-account">
    <div className="cptx-section-block">
      <div className="cptx-section-block-title">
        <h1>{string.settings.appearance}</h1>
      </div>
      <div className="cptx-section-block-content">
        <SettingsGeneralLanguageWrapper />
        <SettingsGeneralThemeWrapper />
      </div>
      <div className="cptx-section-block-title">
        <h1>{string.settings.notifications}</h1>
      </div>
      <div className="cptx-section-block-content">
        <SettingsGeneralShowEmailPreviewWrapper />
      </div>
      <div className="cptx-section-block-title">
        <h1>{string.settings.about}</h1>
      </div>
      <div className="cptx-section-block-content">
        <UsefulLinksBlock />
      </div>
    </div>
  </div>
);

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

export default SettingGeneral;
