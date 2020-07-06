import React from 'react';
import PropTypes from 'prop-types';
import string from './../lang';
import './settingaliasblock.scss';

const localize = string.settings.address_manager;

const AddressManagerBlock = props => (
  <div id="settings-account-domains" className="cptx-section-item">
    <span className="cptx-section-item-title">{localize.title}</span>
    <span className="cptx-section-item-description">
      {localize.description}
    </span>
    <div className="cptx-section-item-control">
      <button
        className="button-b"
        onClick={() => {
          props.onChangePanel('address-manager');
        }}
      >
        <span>{localize.manage}</span>
      </button>
    </div>
  </div>
);

AddressManagerBlock.propTypes = {
  onChangePanel: PropTypes.func
};

export default AddressManagerBlock;
