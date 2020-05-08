import React from 'react';
import string from './../lang';
import PropTypes from 'prop-types';
import './settingcustomdomainsblock.scss';

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
    {props.domains.map(domain => {
      return (
        <CustomDomainItem
          key={domain}
          domainObject={domain}
          onClickDeleteCustomDomain={props.onClickDeleteCustomDomain}
          onClickIsFromNotVerifiedOption={props.onClickIsFromNotVerifiedOption}
        />
      );
    })}
  </div>
);

const CustomDomainItem = props => {
  return (
    <div className="criptext-cdomain-item-wrapper">
      <div className="criptext-cdomain-item-name">
        {props.domainObject.name}
      </div>
      {customDomainNotValidated(props)}
      <div className="criptext-cdomain-item-delete">
        <button
          className="button-b"
          onClick={() => props.onClickDeleteCustomDomain(props.domainObject)}
        >
          <span>{string.settings.custom_domains.remove}</span>
        </button>
      </div>
    </div>
  );
};

const customDomainNotValidated = props => {
  if (!props.domainObject.validated) {
    return (
      <button
        className="criptext-cdomain-button-not-validated"
        onClick={() =>
          props.onClickIsFromNotVerifiedOption(props.domainObject.name)
        }
      >
        {string.settings.custom_domains.not_verified}
      </button>
    );
  }
  return '';
};

CustomDomainsBlock.propTypes = {
  domains: PropTypes.array,
  onChangePanel: PropTypes.func,
  onClickDeleteCustomDomain: PropTypes.func,
  onClickIsFromNotVerifiedOption: PropTypes.func
};

CustomDomainItem.propTypes = {
  domainObject: PropTypes.object,
  onClickDeleteCustomDomain: PropTypes.func
};

export default CustomDomainsBlock;
