import React from 'react';
import PropTypes from 'prop-types';
import { Switch } from 'react-switch-input';
import string from './../lang';
import './settingaliasblock.scss';

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
    {Object.keys(props.aliasesByDomain).length > 0 &&
      Object.keys(props.aliasesByDomain).map(domain => {
        return (
          <AliasDomainContainer
            domain={domain}
            aliases={props.aliasesByDomain[domain]}
            onChangeAliasStatus={props.onChangeAliasStatus}
          />
        );
      })}
  </div>
);

const AliasDomainContainer = props => (
  <div>
    <span className="cptx-section-item-title">{props.domain}</span>
    {props.aliases.map(alias => <AliasItem onChangeAliasStatus={props.onChangeAliasStatus} {...alias} />)}
  </div>
);

const AliasItem = props => (
  <div className="criptext-alias-item-container">
    <div className="criptext-alias-item-wrapper">
      <i className="icon-exit criptext-alias-item-delete" />
      <div className="criptext-alias-item-name">
        {props.name}
        {!props.active && <span>&nbsp;(disabled)</span>}
      </div>
    </div>
    <Switch
      theme="two"
      name={`aliasItem${props.rowId}`}
      onChange={() => {
        props.onChangeAliasStatus(props.rowId, props.domain, !props.active)
      }}
      checked={props.active}
    />
  </div>
);

AliasesBlock.propTypes = {
  onChangePanel: PropTypes.func
};

export default AliasesBlock;
