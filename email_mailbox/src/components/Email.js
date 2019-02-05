import React from 'react';
import PropTypes from 'prop-types';
import FileWrapper from './FileWrapper';
import MenuHOC from './MenuHOC';
import PopupHOC from './PopupHOC';
import DialogPopup from './DialogPopup';
import EmailMoreInfo from './EmailMoreInfo';
import EmailActions from './EmailActions';
import ButtonUnsend from './ButtonUnsendWrapper';
import AvatarImage from './AvatarImage';
import { EmailStatus } from './../utils/const';
import string from '../lang';
import './email.scss';

const DeletePermanenltyPopup = PopupHOC(DialogPopup);
const PopOverEmailMoreInfo = MenuHOC(EmailMoreInfo);
const PopOverEmailActions = MenuHOC(EmailActions);
const draftText = 'Draft';

const Email = props => (
  <div>
    {props.popupContent && (
      <DeletePermanenltyPopup
        popupPosition={{ left: '45%', top: '45%' }}
        {...props.popupContent}
        onRightButtonClick={props.handlePopupConfirm}
        onLeftButtonClick={props.dismissPopup}
        onTogglePopup={props.dismissPopup}
        theme={'dark'}
      />
    )}
    <div
      className={`email-container ${defineEmailState(
        props.displayEmail,
        props.staticOpen
      )} ${defineEmailType(props.isUnsend, props.isDraft)}`}
    >
      <div className="email-info" onClick={props.onToggleEmail}>
        <div className="email-info-letter">
          <AvatarImage
            color={props.email.color}
            avatarUrl={props.avatarUrl}
            letters={props.letters}
          />
        </div>
        <div className="email-info-content">
          <div className="email-info-content-line">
            <div className="email-info-content-from">
              {props.isDraft ? (
                <span>{draftText}</span>
              ) : (
                <span>{showContacts(props.email.from)}</span>
              )}
            </div>
            <div className="email-info-content-detail">
              {renderFileExist(props.email.fileTokens)}
              <span className="email-info-content-detail-date">
                {props.email.date}
              </span>
            </div>
          </div>
          {isExpand(props.displayEmail, props.staticOpen)
            ? renderEmailInfoExpand(props)
            : renderEmailInfoCollapse(props.email)}
        </div>
      </div>
      <hr />
      <div className="email-body">
        <div disabled={props.hideView || props.isUnsend} className="email-text">
          <div dangerouslySetInnerHTML={{ __html: props.emailContent }} />
        </div>
        {!!props.files.length &&
          isExpand(props.displayEmail, props.staticOpen) && (
            <div
              disabled={props.hideView || props.isUnsend}
              className="email-files"
            >
              {props.files.map((file, index) => {
                return (
                  <FileWrapper key={index} file={file} email={props.email} />
                );
              })}
            </div>
          )}
      </div>
    </div>
    {props.staticOpen && (
      <div className="email-segment-controls">
        <div className="replay-button" onClick={() => props.onReplyLast()}>
          <i className="icon-replay" />
          <span>{string.mailbox.reply}</span>
        </div>
        <div className="replay-all-button" onClick={ev => props.onReplyAll(ev)}>
          <i className="icon-replay-all" />
          <span>{string.mailbox.reply_all}</span>
        </div>
        <div className="forward-button" onClick={ev => props.onForward(ev)}>
          <i className="icon-forward" />
          <span>{string.mailbox.forward}</span>
        </div>
      </div>
    )}
  </div>
);

const renderEmailInfoCollapse = email => (
  <div className="email-info-content-line">
    {renderEmailStatus(email.status)}
    <span className="email-preview-content">{email.preview}</span>
  </div>
);

const renderEmailInfoExpand = props => (
  <div className="email-info-content-line">
    <div className="email-info-content-to">
      {renderEmailStatus(props.email.status)}
      <span>{`To ${showContacts(props.email.to)}`}</span>
      <div className="email-info-content-to-more">
        <span onClick={props.onTooglePopOverEmailMoreInfo}>
          {string.mailbox.more}
        </span>
        <PopOverEmailMoreInfo
          bcc={props.email.bcc}
          cc={props.email.cc}
          from={props.email.from}
          to={props.email.to}
          date={props.email.dateLong}
          isHidden={props.isHiddenPopOverEmailMoreInfo}
          menuPosition={{ left: '-150px', top: '25px' }}
          onToggleMenu={props.onTooglePopOverEmailMoreInfo}
          subject={props.email.subject}
        />
      </div>
    </div>
    <div className="email-info-content-actions">
      {props.isDraft ? (
        <div>
          <i
            className="icon-pencil"
            onClick={ev => props.onClickEditDraft(ev)}
          />
        </div>
      ) : (
        <div>
          {props.isFromMe &&
            !props.isUnsend &&
            props.email.secure && (
              <ButtonUnsend
                onClick={props.onClickUnsendButton}
                status={props.buttonUnsendStatus}
              />
            )}
          <i className="icon-replay" onClick={ev => props.onReplyEmail(ev)} />
          <i
            className="icon-dots"
            onClick={ev => props.onTogglePopOverEmailActions(ev)}
          >
            <PopOverEmailActions
              isHidden={props.isHiddenPopOverEmailActions}
              isSpam={props.isSpam}
              isTrash={props.isTrash}
              hasBoundary={!!props.email.boundary}
              menuPosition={{ right: '-32px', top: '28px' }}
              onReplyEmail={props.onReplyEmail}
              onReplyAll={props.onReplyAll}
              onForward={props.onForward}
              onMarkAsSpam={props.onMarkAsSpam}
              onDelete={props.onDelete}
              onDeletePermanently={props.handleClickPermanentlyDeleteEmail}
              onToggleMenu={props.onTogglePopOverEmailActions}
              onOpenEmailSource={props.onOpenEmailSource}
              onPrintEmail={props.onPrintEmail}
            />
          </i>
        </div>
      )}
    </div>
  </div>
);

const showContacts = contacts => {
  return contacts.reduce(
    (result, contact) => `${result} ${contact.name || contact.email}`,
    ''
  );
};

const renderEmailStatus = status => {
  return <div className="email-status">{defineEmailStatus(status)}</div>;
};

const renderFileExist = fileTokens => {
  if (fileTokens.length) {
    return (
      <div className="email-file-icon">
        <i className="icon-attach" />
      </div>
    );
  }
  return null;
};

const renderMuteIcon = props => (
  <i
    className={props.email.isMuted ? 'icon-bell-mute' : 'icon-bell'}
    onClick={ev => props.toggleMute(ev)}
  />
);

const defineEmailStatus = status => {
  switch (status) {
    case EmailStatus.SENT:
      return <i className="icon-checked status-sent" />;
    case EmailStatus.DELIVERED:
      return <i className="icon-double-checked status-delivered" />;
    case EmailStatus.READ:
      return <i className="icon-double-checked status-opened" />;
    case EmailStatus.SENDING:
      return <i className="icon-time status-sending" />;
    default:
      return null;
  }
};

const defineEmailState = (displayEmail, staticOpen) => {
  if (isExpand(displayEmail, staticOpen)) {
    return 'email-container-expand';
  }
  return 'email-container-collapse';
};

const defineEmailType = (isUnsend, isDraft) => {
  if (isUnsend) {
    return 'email-unsend';
  } else if (isDraft) {
    return 'email-draft';
  }
  return 'email-normal';
};

const isExpand = (displayEmail, staticOpen) => {
  return displayEmail || staticOpen;
};

renderEmailInfoExpand.propTypes = {
  buttonUnsendStatus: PropTypes.number,
  email: PropTypes.object,
  handleClickPermanentlyDeleteEmail: PropTypes.func,
  isDraft: PropTypes.bool,
  isSpam: PropTypes.bool,
  isTrash: PropTypes.bool,
  isFromMe: PropTypes.bool,
  isHiddenPopOverEmailActions: PropTypes.bool,
  isHiddenPopOverEmailMoreInfo: PropTypes.bool,
  isUnsend: PropTypes.bool,
  onClickEditDraft: PropTypes.func,
  onClickUnsendButton: PropTypes.func,
  onDelete: PropTypes.func,
  onDeletePermanently: PropTypes.func,
  onForward: PropTypes.func,
  onMarkAsSpam: PropTypes.func,
  onOpenEmailSource: PropTypes.func,
  onPrintEmail: PropTypes.func,
  onReplyEmail: PropTypes.func,
  onReplyAll: PropTypes.func,
  onTogglePopOverEmailActions: PropTypes.func,
  onTooglePopOverEmailMoreInfo: PropTypes.func
};

renderMuteIcon.propTypes = {
  email: PropTypes.object,
  toggleMute: PropTypes.func
};

Email.propTypes = {
  avatarUrl: PropTypes.string,
  dismissPopup: PropTypes.func,
  displayEmail: PropTypes.bool,
  email: PropTypes.object,
  emailContent: PropTypes.string,
  files: PropTypes.array,
  handleClickPermanentlyDeleteEmail: PropTypes.func,
  handlePopupConfirm: PropTypes.func,
  hideView: PropTypes.bool,
  isDraft: PropTypes.bool,
  isUnsend: PropTypes.bool,
  letters: PropTypes.string,
  onForward: PropTypes.func,
  onReplyAll: PropTypes.func,
  onReplyLast: PropTypes.func,
  onToggleEmail: PropTypes.func,
  popupContent: PropTypes.object,
  staticOpen: PropTypes.bool
};

export default Email;
