import React from 'react';
import PropTypes from 'prop-types';
import TagsInput from 'react-tagsinput';
import AutocompleteWrapper from './AutocompleteWrapper';
import TagRecipient from './TagRecipient';
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
      addKeys={[9, 13, 32, 186, 188]}
      addOnBlur={true}
      addOnPaste={true}
      className="recipient-tags"
      focusedClassName={'cstm-tags-border'}
      inputProps={{
        className: 'tags-input',
        placeholder: ''
      }}
      onlyUnique={true}
      onChange={props.onChangeToTag}
      onValidationReject={props.handleOnValidationRejectToTag}
      pasteSplit={pasteSplit}
      renderInput={AutocompleteWrapper}
      renderTag={TagRecipient}
      tagProps={{
        classNameRemove: 'icon-exit'
      }}
      validationRegex={props.emailRegex}
      value={props.toTags}
    />
  </div>
);

const renderRecipientCc = props => (
  <div className="recipient-content">
    <span className="recipient-input-label">Cc:</span>
    <TagsInput
      addKeys={[9, 13, 32, 186, 188]}
      addOnBlur={true}
      addOnPaste={true}
      className="recipient-tags"
      focusedClassName={'cstm-tags-border'}
      inputProps={{
        className: 'tags-input',
        placeholder: ''
      }}
      onChange={props.onChangeCcTag}
      onlyUnique={true}
      onValidationReject={props.handleOnValidationRejectCcTag}
      pasteSplit={pasteSplit}
      renderInput={AutocompleteWrapper}
      renderTag={TagRecipient}
      tagProps={{
        classNameRemove: 'icon-exit'
      }}
      validationRegex={props.emailRegex}
      value={props.ccTags}
    />
  </div>
);

const renderRecipientBcc = props => (
  <div className="recipient-content">
    <span className="recipient-input-label">Bcc:</span>
    <TagsInput
      addKeys={[9, 13, 32, 186, 188]}
      addOnBlur={true}
      addOnPaste={true}
      className="recipient-tags"
      focusedClassName={'cstm-tags-border'}
      inputProps={{
        className: 'tags-input',
        placeholder: ''
      }}
      onChange={props.onChangeBccTag}
      onlyUnique={true}
      onValidationReject={props.handleOnValidationRejectBccTag}
      pasteSplit={pasteSplit}
      renderInput={AutocompleteWrapper}
      renderTag={TagRecipient}
      tagProps={{
        classNameRemove: 'icon-exit'
      }}
      validationRegex={props.emailRegex}
      value={props.bccTags}
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
