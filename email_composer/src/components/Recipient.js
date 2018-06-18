import React from 'react';
import PropTypes from 'prop-types';
import TagsInput from 'react-tagsinput';
import AutocompleteWrapper from './AutocompleteWrapper';
import { pasteSplit } from './../utils/StringUtils';
import 'react-tagsinput/react-tagsinput.css';
import './recipient.css';

const Recipient = props => (
  <div className="recipient-container ">
    {renderRecipientTo(props)}
    {props.isCollapsedMoreRecipient ? null : (
      <div>
        {renderRecipientCc(props)}
        {renderRecipientBcc(props)}
      </div>
    )}
    <div className="recipient-toggle" onClick={props.onToggleRecipient}>
      <i
        className={
          props.isCollapsedMoreRecipient ? 'icon-arrow-down' : 'icon-arrow-up'
        }
      />
    </div>
  </div>
);

const renderRecipientTo = props => (
  <div className="recipient-content">
    <span className="recipient-input-label">To:</span>
    <TagsInput
      renderInput={AutocompleteWrapper}
      onlyUnique={true}
      className="recipient-tags"
      focusedClassName={'cstm-tags-border'}
      addOnPaste={true}
      addOnBlur={true}
      tagProps={{
        className: 'tag-item',
        classNameRemove: 'icon-exit'
      }}
      inputProps={{
        className: 'tags-input',
        placeholder: ''
      }}
      validationRegex={props.emailRegex}
      addKeys={[9, 13, 32, 186, 188]}
      value={props.toTags}
      onChange={props.onChangeToTag}
      onValidationReject={props.handleOnValidationRejectToTag}
      pasteSplit={pasteSplit}
    />
  </div>
);

const renderRecipientCc = props => (
  <div className="recipient-content">
    <span className="recipient-input-label">Cc:</span>
    <TagsInput
      renderInput={AutocompleteWrapper}
      onlyUnique={true}
      className="recipient-tags"
      focusedClassName={'cstm-tags-border'}
      addOnPaste={true}
      addOnBlur={true}
      tagProps={{
        className: 'tag-item',
        classNameRemove: 'icon-exit'
      }}
      inputProps={{
        className: 'tags-input',
        placeholder: ''
      }}
      validationRegex={props.emailRegex}
      addKeys={[9, 13, 32, 186, 188]}
      value={props.ccTags}
      onChange={props.onChangeCcTag}
      onValidationReject={props.handleOnValidationRejectCcTag}
      pasteSplit={pasteSplit}
    />
  </div>
);

const renderRecipientBcc = props => (
  <div className="recipient-content">
    <span className="recipient-input-label">Bcc:</span>
    <TagsInput
      renderInput={AutocompleteWrapper}
      onlyUnique={true}
      className="recipient-tags"
      focusedClassName={'cstm-tags-border'}
      addOnPaste={true}
      addOnBlur={true}
      tagProps={{
        className: 'tag-item',
        classNameRemove: 'icon-exit'
      }}
      inputProps={{
        className: 'tags-input',
        placeholder: ''
      }}
      validationRegex={props.emailRegex}
      addKeys={[9, 13, 32, 186, 188]}
      value={props.bccTags}
      onChange={props.onChangeBccTag}
      onValidationReject={props.handleOnValidationRejectBccTag}
      pasteSplit={pasteSplit}
    />
  </div>
);

Recipient.propTypes = {
  isCollapsedMoreRecipient: PropTypes.bool,
  onToggleRecipient: PropTypes.func
};

renderRecipientTo.propTypes = {
  emailRegex: PropTypes.string,
  handleOnValidationRejectToTag: PropTypes.func,
  onChangeToTag: PropTypes.func,
  toTags: PropTypes.string
};

renderRecipientCc.propTypes = {
  ccTags: PropTypes.string,
  emailRegex: PropTypes.string,
  handleOnValidationRejectCcTag: PropTypes.func,
  onChangeCcTag: PropTypes.func
};

renderRecipientBcc.propTypes = {
  bccTags: PropTypes.string,
  emailRegex: PropTypes.string,
  handleOnValidationRejectBccTag: PropTypes.func,
  onChangeBccTag: PropTypes.func
};

export default Recipient;
