import React from 'react';
import PropTypes from 'prop-types';
import FileWrapper from './FileWrapper';
import MenuHOC from './MenuHOC';
import EmailMoreInfo from './EmailMoreInfo';
import EmailActions from './EmailActions';
import ButtonUnsend from './ButtonUnsendWrapper';
import { EmailStatus } from './../utils/const';
import AttachItem, { AttachItemStatus } from './AttachItem';
import './email.css';

const PopOverEmailMoreInfo = MenuHOC(EmailMoreInfo);
const PopOverEmailActions = MenuHOC(EmailActions);
const draftText = 'Draft';

const Email = props =>
  props.displayEmail || props.staticOpen
    ? renderEmailExpand(props)
    : renderEmailCollapse(props);

const renderEmailCollapse = props => (
  <div
    className={`email-container email-container-collapse ${defineEmailType(
      props.isUnsend,
      props.isDraft
    )}`}
    onClick={props.onToggleEmail}
  >
    <div className="email-info">
      <div
        style={{ background: props.email.color }}
        className="email-info-letter"
      >
        <span>{props.email.letters}</span>
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
        <div className="email-info-content-line">
          {renderEmailStatus(props.email.status)}
          <span className="email-preview-content">{props.email.preview}</span>
        </div>
      </div>
    </div>
  </div>
);

const renderEmailExpand = props => (
  <div>
    <div
      className={`email-container email-container-expand ${defineEmailType(
        props.isUnsend,
        props.isDraft
      )}`}
    >
      <div className="email-info" onClick={props.onToggleEmail}>
        <div
          style={{ background: props.email.color }}
          className="email-info-letter"
        >
          <span>{props.email.letters}</span>
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
          <div className="email-info-content-line">
            <div className="email-info-content-to">
              {renderEmailStatus(props.email.status)}
              <span>{`To ${showContacts(props.email.to)}`}</span>
              <div className="email-info-content-to-more">
                <span onClick={props.onTooglePopOverEmailMoreInfo}>more</span>
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
                      <ButtonUnsend onClick={props.onClickUnsendButton} />
                    )}
                  <i
                    className="icon-replay"
                    onClick={ev => props.onReplyEmail(ev)}
                  />
                  <i
                    className="icon-dots"
                    onClick={ev => props.onTogglePopOverEmailActions(ev)}
                  >
                    <PopOverEmailActions
                      isHidden={props.isHiddenPopOverEmailActions}
                      menuPosition={{ right: '-32px', top: '28px' }}
                      onReplyEmail={props.onReplyEmail}
                      onReplyAll={props.onReplyAll}
                      onForward={props.onForward}
                      onToggleMenu={props.onTogglePopOverEmailActions}
                    />
                  </i>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <hr />
      <div className="email-body">
        <div disabled={props.hideView || props.isUnsend} className="email-text">
          <div dangerouslySetInnerHTML={{ __html: props.email.content }} />
        </div>
        {props.files.length ? (
          <div
            disabled={props.hideView || props.isUnsend}
            className="email-files"
          >
            {props.files.map((file, index) => {
              return file.status === AttachItemStatus.UNSENT ? (
                <AttachItem key={index} status={file.status} />
              ) : (
                <FileWrapper key={index} file={file} email={props.email} />
              );
            })}
          </div>
        ) : null}
      </div>
    </div>
    {props.staticOpen ? (
      <div className="email-segment-controls">
        <div className="replay-button" onClick={() => props.onReplyLast()}>
          <i className="icon-replay" />
          <span>Reply</span>
        </div>
        <div className="replay-all-button" onClick={ev => props.onReplyAll(ev)}>
          <i className="icon-replay-all" />
          <span>Reply All</span>
        </div>
        <div className="forward-button" onClick={ev => props.onForward(ev)}>
          <i className="icon-forward" />
          <span>Forward</span>
        </div>
      </div>
    ) : null}
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
      return <i className="icon-checked status-delivered" />;
    case EmailStatus.OPENED:
      return <i className="icon-checked status-opened" />;
    default:
      return null;
  }
};

const defineEmailType = (isUnsend, isDraft) => {
  if (isUnsend) {
    return 'email-unsend';
  } else if (isDraft) {
    return 'email-draft';
  }
  return 'email-normal';
};

renderEmailCollapse.propTypes = {
  email: PropTypes.object,
  isDraft: PropTypes.bool,
  isUnsend: PropTypes.bool,
  onToggleEmail: PropTypes.func
};

renderEmailExpand.propTypes = {
  email: PropTypes.object,
  files: PropTypes.array,
  hideView: PropTypes.bool,
  isDraft: PropTypes.bool,
  isFromMe: PropTypes.bool,
  isHiddenPopOverEmailActions: PropTypes.bool,
  isHiddenPopOverEmailMoreInfo: PropTypes.bool,
  isUnsend: PropTypes.bool,
  onClickEditDraft: PropTypes.func,
  onClickUnsendButton: PropTypes.func,
  onForward: PropTypes.func,
  onReplyAll: PropTypes.func,
  onReplyEmail: PropTypes.func,
  onReplyLast: PropTypes.func,
  onToggleEmail: PropTypes.func,
  onTogglePopOverEmailActions: PropTypes.func,
  onTooglePopOverEmailMoreInfo: PropTypes.func,
  staticOpen: PropTypes.func
};

renderMuteIcon.propTypes = {
  email: PropTypes.object,
  toggleMute: PropTypes.func
};

Email.propTypes = {
  email: PropTypes.object
};

export default Email;
