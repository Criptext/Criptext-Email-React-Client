import React from 'react';
import PropTypes from 'prop-types';
import './aliases.scss';
import string from '../lang';

const { alias } = string;

const Aliases = props => (
  <div className="settings-content">
    <div className="settings-alias-header"> </div>
    <div className="settings-content-scroll cptx-scrollbar">
      {props.success ? <AddSuccess {...props} /> : <AddAlias {...props} />}
    </div>
  </div>
);

const AddAlias = props => (
  <div className="settings-alias-content">
    <div className="settings-alias-title">{alias.add.title}</div>
    <div className="settings-alias-desc">{alias.add.description}</div>
    <div className="settings-alias-input">
      <input
        className={props.errorMessage ? 'alias-error' : ''}
        type="text"
        value={props.input}
        onChange={props.onChangeInput}
        disabled={props.loading}
      />
      <span>@</span>
      <select onChange={props.onChangeDomain} value={props.selectedDomain}>
        {props.domains.map((domain, index) => {
          return (
            <option key={index} value={domain}>
              {domain}
            </option>
          );
        })}
      </select>
      {props.errorMessage && (
        <span className="alias-error">{props.errorMessage}</span>
      )}
    </div>
    {props.loading ? (
      <Loading />
    ) : (
      <div className="settings-alias-buttons">
        <button className="button-cancel" onClick={props.onCancel}>
          {alias.add.cancelButtonLabel}
        </button>
        <button
          className="button-confirm"
          onClick={props.onSave}
          disabled={props.errorMessage}
        >
          {alias.add.saveButtonLabel}
        </button>
      </div>
    )}
  </div>
);

const AddSuccess = props => (
  <div className="settings-alias-content">
    <div className="settings-alias-title">{alias.add.successTitle} </div>
    <div className="settings-alias-desc">
      {string.formatString(
        alias.add.successMessage,
        `${props.input}@${props.selectedDomain}`
      )}
    </div>
    <div className="settings-alias-buttons">
      <button className="button-confirm" onClick={props.onCancel}>
        {alias.add.doneButtonLabel}
      </button>
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

Aliases.propTypes = {
  success: PropTypes.bool
};

AddAlias.propTypes = {
  errorMessage: PropTypes.string,
  input: PropTypes.string,
  onChangeInput: PropTypes.func,
  loading: PropTypes.bool,
  onChangeDomain: PropTypes.func,
  selectedDomain: PropTypes.string,
  domains: PropTypes.array,
  onCancel: PropTypes.func,
  onSave: PropTypes.func
};

AddSuccess.propTypes = {
  input: PropTypes.string,
  selectedDomain: PropTypes.string,
  onCancel: PropTypes.func
};

export default Aliases;
