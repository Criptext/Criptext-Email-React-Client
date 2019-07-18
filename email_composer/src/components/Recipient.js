import React from 'react';
import PropTypes from 'prop-types';
import TagsInput from 'react-tagsinput';
import AutocompleteWrapper from './AutocompleteWrapper';
import TagRecipient from './TagRecipient';
import { pasteSplit } from './../utils/StringUtils';
import string from './../lang';
import './recipient.scss';

const { inputLabels } = string;

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
    <span className="recipient-input-label">{inputLabels.to}</span>
    <TagsInput
      addKeys={[9, 13]}
      addOnBlur={true}
      addOnPaste={true}
      className="recipient-tags"
      focusedClassName={'cstm-tags-border'}
      inputProps={{
        className: 'tags-input',
        isfocusrecipientinput: props.isFocusRecipientInput ? 'true' : 'false',
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
        type: 'to',
        classNameIconRemove: 'icon-exit',
        checkDisableSendButton: props.checkDisableSendButton,
        onBlur: props.onBlurTag,
        onChange: props.onChangeTag,
        onDoubleClick: props.onDoubleClickTag
      }}
      value={props.toTags}
    />
  </div>
);

const renderRecipientCc = props => (
  <div className="recipient-content">
    <span className="recipient-input-label">{inputLabels.cc}</span>
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
        type: 'cc',
        classNameIconRemove: 'icon-exit',
        checkDisableSendButton: props.checkDisableSendButton,
        onBlur: props.onBlurTag,
        onChange: props.onChangeTag,
        onDoubleClick: props.onDoubleClickTag
      }}
      value={props.ccTags}
    />
  </div>
);

const renderRecipientBcc = props => (
  <div className="recipient-content">
    <span className="recipient-input-label">{inputLabels.bcc}</span>
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
        type: 'bcc',
        classNameIconRemove: 'icon-exit',
        checkDisableSendButton: props.checkDisableSendButton,
        onBlur: props.onBlurTag,
        onChange: props.onChangeTag,
        onDoubleClick: props.onDoubleClickTag
      }}
      value={props.bccTags}
    />
  </div>
);

Recipient.propTypes = {
  isCollapsedMoreRecipient: PropTypes.bool,
  onToggleRecipient: PropTypes.func
};

renderRecipientTo.propTypes = {
  checkDisableSendButton: PropTypes.func,
  handleOnValidationRejectToTag: PropTypes.func,
  inputToValue: PropTypes.string,
  isFocusRecipientInput: PropTypes.bool,
  onBlurTag: PropTypes.func,
  onChangeToInput: PropTypes.func,
  onChangeToTag: PropTypes.func,
  onChangeTag: PropTypes.func,
  onDoubleClickTag: PropTypes.func,
  toTags: PropTypes.string
};

renderRecipientCc.propTypes = {
  ccTags: PropTypes.string,
  checkDisableSendButton: PropTypes.func,
  handleOnValidationRejectCcTag: PropTypes.func,
  inputCcValue: PropTypes.string,
  onBlurTag: PropTypes.func,
  onChangeCcInput: PropTypes.func,
  onChangeCcTag: PropTypes.func,
  onChangeTag: PropTypes.func,
  onDoubleClickTag: PropTypes.func
};

renderRecipientBcc.propTypes = {
  bccTags: PropTypes.string,
  checkDisableSendButton: PropTypes.func,
  handleOnValidationRejectBccTag: PropTypes.func,
  inputBccValue: PropTypes.string,
  onBlurTag: PropTypes.func,
  onChangeBccInput: PropTypes.func,
  onChangeBccTag: PropTypes.func,
  onChangeTag: PropTypes.func,
  onDoubleClickTag: PropTypes.func
};

export default Recipient;
