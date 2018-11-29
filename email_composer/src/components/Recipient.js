import React from 'react';
import PropTypes from 'prop-types';
import TagsInput from 'react-tagsinput';
import AutocompleteWrapper from './AutocompleteWrapper';
import TagRecipient from './TagRecipient';
import { pasteSplit } from './../utils/StringUtils';
import './recipient.scss';

const Recipient = props => (
  <div className="recipient-container ">
    {renderRecipientTo(props)}
    <div
      className={`recipient-more ${
        props.isCollapsedMoreRecipient ? 'collapsed' : 'expanded'
      }`}
    >
      {props.isCollapsedMoreRecipient ? null : (
        <div>
          {renderRecipientCc(props)}
          {renderRecipientBcc(props)}
        </div>
      )}
    </div>
    <div className="recipient-toggle" onClick={() => props.onToggleRecipient()}>
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
      addKeys={[9, 13]}
      addOnBlur={true}
      addOnPaste={true}
      className="recipient-tags"
      focusedClassName={'cstm-tags-border'}
      inputProps={{
        className: 'tags-input',
        isfocuseditorinput: props.isFocusEditorInput ? 'true' : 'false',
        placeholder: '',
        name: 'To'
      }}
      inputValue={props.inputToValue}
      onlyUnique={true}
      onChange={props.onChangeToTag}
      onChangeInput={props.onChangeToInput}
      onValidationReject={props.handleOnValidationRejectToTag}
      pasteSplit={pasteSplit}
      renderInput={AutocompleteWrapper}
      renderTag={TagRecipient}
      tagProps={{
        classNameRemove: 'icon-exit',
        checkDisableSendButton: props.checkDisableSendButton
      }}
      value={props.toTags}
    />
  </div>
);

const renderRecipientCc = props => (
  <div className="recipient-content">
    <span className="recipient-input-label">Cc:</span>
    <TagsInput
      addKeys={[9, 13, 32, 188]}
      addOnBlur={true}
      addOnPaste={true}
      className="recipient-tags"
      focusedClassName={'cstm-tags-border'}
      inputProps={{
        className: 'tags-input',
        placeholder: '',
        name: 'Cc'
      }}
      inputValue={props.inputCcValue}
      onChange={props.onChangeCcTag}
      onChangeInput={props.onChangeCcInput}
      onlyUnique={true}
      onValidationReject={props.handleOnValidationRejectCcTag}
      pasteSplit={pasteSplit}
      renderInput={AutocompleteWrapper}
      renderTag={TagRecipient}
      tagProps={{
        classNameRemove: 'icon-exit',
        checkDisableSendButton: props.checkDisableSendButton
      }}
      value={props.ccTags}
    />
  </div>
);

const renderRecipientBcc = props => (
  <div className="recipient-content">
    <span className="recipient-input-label">Bcc:</span>
    <TagsInput
      addKeys={[9, 13, 32, 188]}
      addOnBlur={true}
      addOnPaste={true}
      className="recipient-tags"
      focusedClassName={'cstm-tags-border'}
      inputProps={{
        className: 'tags-input',
        placeholder: '',
        name: 'Bcc'
      }}
      inputValue={props.inputBccValue}
      onChange={props.onChangeBccTag}
      onChangeInput={props.onChangeBccInput}
      onlyUnique={true}
      onValidationReject={props.handleOnValidationRejectBccTag}
      pasteSplit={pasteSplit}
      renderInput={AutocompleteWrapper}
      renderTag={TagRecipient}
      tagProps={{
        classNameRemove: 'icon-exit',
        checkDisableSendButton: props.checkDisableSendButton
      }}
      value={props.bccTags}
    />
  </div>
);

Recipient.propTypes = {
  isCollapsedMoreRecipient: PropTypes.bool,
  isFocusEditorInput: PropTypes.bool,
  onToggleRecipient: PropTypes.func
};

renderRecipientTo.propTypes = {
  checkDisableSendButton: PropTypes.func,
  handleOnValidationRejectToTag: PropTypes.func,
  inputToValue: PropTypes.string,
  isFocusEditorInput: PropTypes.bool,
  onChangeToInput: PropTypes.func,
  onChangeToTag: PropTypes.func,
  toTags: PropTypes.string
};

renderRecipientCc.propTypes = {
  ccTags: PropTypes.string,
  checkDisableSendButton: PropTypes.func,
  handleOnValidationRejectCcTag: PropTypes.func,
  inputCcValue: PropTypes.string,
  onChangeCcInput: PropTypes.func,
  onChangeCcTag: PropTypes.func
};

renderRecipientBcc.propTypes = {
  bccTags: PropTypes.string,
  checkDisableSendButton: PropTypes.func,
  handleOnValidationRejectBccTag: PropTypes.func,
  inputBccValue: PropTypes.string,
  onChangeBccInput: PropTypes.func,
  onChangeBccTag: PropTypes.func
};

export default Recipient;
