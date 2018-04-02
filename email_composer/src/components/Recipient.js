import React from 'react';
import PropTypes from 'prop-types';
import TagsInput from 'react-tagsinput';
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
    <TagsInput
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
        placeholder: props.toPlaceholder
      }}
      validationRegex={props.emailRegex}
      addKeys={[9, 13, 32, 186, 188]}
      value={props.toTags}
      onChange={props.onChangeToTag}
      onValidationReject={props.handleOnValidationRejectToTag}
    />
  </div>
);

const renderRecipientCc = props => (
  <div className="recipient-content">
    <TagsInput
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
        placeholder: props.ccPlaceholder
      }}
      validationRegex={props.emailRegex}
      addKeys={[9, 13, 32, 186, 188]}
      value={props.ccTags}
      onChange={props.onChangeCcTag}
      onValidationReject={props.handleOnValidationRejectCcTag}
    />
  </div>
);

const renderRecipientBcc = props => (
  <div className="recipient-content">
    <TagsInput
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
        placeholder: props.bccPlaceholder
      }}
      validationRegex={props.emailRegex}
      addKeys={[9, 13, 32, 186, 188]}
      value={props.bccTags}
      onChange={props.onChangeBccTag}
      onValidationReject={props.handleOnValidationRejectBccTag}
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
  toPlaceholder: PropTypes.string,
  toTags: PropTypes.string
};

renderRecipientCc.propTypes = {
  ccPlaceholder: PropTypes.string,
  ccTags: PropTypes.string,
  emailRegex: PropTypes.string,
  handleOnValidationRejectCcTag: PropTypes.func,
  onChangeCcTag: PropTypes.func
};

renderRecipientBcc.propTypes = {
  bccPlaceholder: PropTypes.string,
  bccTags: PropTypes.string,
  emailRegex: PropTypes.string,
  handleOnValidationRejectBccTag: PropTypes.func,
  onChangeBccTag: PropTypes.func
};

export default Recipient;
