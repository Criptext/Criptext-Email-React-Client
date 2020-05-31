import React from 'react';
import PropTypes from 'prop-types';
import FileWrapper from './FileWrapper';
import MenuHOC from './MenuHOC';
import PopupHOC from './PopupHOC';
import DialogPopup from './DialogPopup';
import BlockRemoteContentPopup from './BlockRemoteContentPopup';
import EmailMoreInfo from './EmailMoreInfo';
import EmailActions from './EmailActions';
import EmailBlocked from './EmailBlocked';
import ButtonUnsend from './ButtonUnsendWrapper';
import AvatarImage from './AvatarImage';
import ButtonIcon from './ButtonIcon';
import { EmailStatus } from './../utils/const';
import string from '../lang';
import './email.scss';

const DeletePermanenltyPopup = PopupHOC(DialogPopup);
const BlockRemotePopup = PopupHOC(BlockRemoteContentPopup);
const PopOverEmailMoreInfo = MenuHOC(EmailMoreInfo);
const PopOverEmailActions = MenuHOC(EmailActions);
const PopOverEmailBlocked = MenuHOC(EmailBlocked);
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
    {props.popupContentBlockRemoteContent && (
      <BlockRemotePopup
        popupPosition={{ left: '45%', top: '45%' }}
        {...props.popupContentBlockRemoteContent}
        onRightButtonClick={props.handlePopupConfirmBlock}
        onLeftButtonClick={props.dismissPopup}
        onTogglePopup={props.dismissPopup}
        theme={'dark'}
      />
    )}
    <div
      className={`cptx-email-container ${defineEmailState(
        props.displayEmail,
        props.staticOpen
      )} ${defineEmailType(props.isUnsend, props.isDraft, props.isEmpty)}`}
    >
      <div
        className="email-info"
        style={{
          height:
            props.blockImagesInline ||
            props.blockImagesContact ||
            props.blockImagesAccount
              ? '105px'
              : '65px'
        }}
        onClick={props.onToggleEmail}
      >
        <div className="email-info-letter">
          <AvatarImage
            color={props.color}
            avatarUrl={props.avatarUrl}
            borderUrl={props.borderUrl}
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
              {renderIcons(
                props.email.fileTokens,
                props.email.secure,
                props.onMouseEnterTooltip,
                props.onMouseLeaveTooltip,
                props.email.id
              )}
              <span className="email-info-content-detail-date">
                {props.date}
              </span>
            </div>
          </div>
          {isExpand(props.displayEmail, props.staticOpen)
            ? renderEmailInfoExpand(props)
            : renderEmailInfoCollapse(props.email.status, props.preview)}
        </div>
        {renderEmailBlocked(props)}
      </div>
      <hr />
      <div className="email-body">
        <div disabled={props.hideView || props.isUnsend} className="email-text">
          <div dangerouslySetInnerHTML={{ __html: theMail(props) }} />
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

const renderEmailInfoCollapse = (status, preview) => (
  <div className="email-info-content-line">
    {renderEmailStatus(status)}
    <span className="email-preview-content">{preview}</span>
  </div>
);

const renderEmailBlocked = props => {
  if (
    props.blockImagesInline ||
    props.blockImagesContact ||
    props.blockImagesAccount
  ) {
    return (
      <div className="email-info-blocked">
        <span>
          <svg
            className="image-blocked"
            data-name="Image blocked"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 16 15"
            version="1.1"
          >
            <title>Group 3</title>
            <g id="Page-1" stroke="none" fill="none">
              <g
                id="BRC-Desktop"
                transform="translate(-296.000000, -210.000000)"
                fill="#BFC3C8"
              >
                <g id="Group" transform="translate(296.000000, 210.000000)">
                  <g id="Group-3">
                    <path
                      d="M7.90386809,13.0000855 L2.56152307,13.0000855 C2.08180568,13.0000855 1.86804559,12.6544802 2.08429126,12.2280413 L5.06699009,6.34697814 C5.28323575,5.9205392 5.6950139,5.88177203 5.98665556,6.26119545 L8.98592494,10.1634829 C9.2775666,10.5429064 9.78711099,10.5750749 10.1251502,10.2352435 L10.858397,9.49536778 C11.1956077,9.15553636 11.6918956,9.19760287 11.9677952,9.58857397 L13.8676087,12.2907287 C14.1418513,12.6825246 13.9761458,13.0000855 13.4964284,13.0000855 L7.90386809,13.0000855 Z M12.9999145,5.0000855 C12.9999145,6.10399398 12.103823,7.0000855 10.9999145,7.0000855 C9.89505273,7.0000855 8.9999145,6.10399398 8.9999145,5.0000855 C8.9999145,3.89617702 9.89505273,3.0000855 10.9999145,3.0000855 C12.103823,3.0000855 12.9999145,3.89617702 12.9999145,5.0000855 Z M1.80972598,8.55e-05 C0.811496627,8.55e-05 -8.55e-05,0.810963882 -8.55e-05,1.81101944 L-8.55e-05,13.1916517 C-8.55e-05,14.1900405 0.811496627,15.0000855 1.80972598,15.0000855 L14.1909363,15.0000855 C15.1883324,15.0000855 15.9999145,14.1900405 15.9999145,13.1916517 L15.9999145,1.81101944 C15.9999145,0.810963882 15.1891656,8.55e-05 14.1909363,8.55e-05 L1.80972598,8.55e-05 Z"
                      id="Fill-1"
                    />
                  </g>
                </g>
              </g>
            </g>
          </svg>
        </span>

        {!props.blockImagesInline &&
        (props.blockImagesContact || props.blockImagesAccount)
          ? string.mailbox.blockRemote.text_2
          : string.mailbox.blockRemote.text}
        <span>
          <button
            className="email-info-button-show-images"
            onClick={ev => props.onTogglePopOverEmailBlocked(ev)}
          >
            {!props.blockImagesInline &&
            (props.blockImagesContact || props.blockImagesAccount)
              ? string.mailbox.blockRemote.show_always
              : string.mailbox.blockRemote.show_images}
            <PopOverEmailBlocked
              menuPosition={{ left: '285px', top: '100px' }}
              isHidden={props.isHiddenPopOverEmailBlocked}
              onToggleMenu={props.onTogglePopOverEmailBlocked}
              onBlockImagesInline={props.handleBlockingEmail}
              onBlockImagesAccount={props.handleClickBlockRemoteContent}
              onBlockImagesContact={props.handleIsTrustedContact}
              blockImagesInline={props.blockImagesInline}
              blockImagesContact={props.blockImagesContact}
              blockImagesAccount={props.blockImagesAccount}
            />
          </button>
        </span>
      </div>
    );
  }
};

const renderEmailInfoExpand = props => (
  <div className="email-info-content-line">
    <div className="email-info-content-to">
      {renderEmailStatus(props.email.status)}
      <span>{`To ${showContacts([
        ...props.email.to,
        ...props.email.cc
      ])}`}</span>
      <div className="email-info-content-to-more">
        <span onClick={props.onTooglePopOverEmailMoreInfo}>
          {string.mailbox.more}
        </span>
        <PopOverEmailMoreInfo
          bcc={props.email.bcc}
          cc={props.email.cc}
          from={props.email.from}
          to={props.email.to}
          date={props.dateLong}
          isHidden={props.isHiddenPopOverEmailMoreInfo}
          menuPosition={{ left: '-102px', top: '25px' }}
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
          <ButtonIcon
            icon={'icon-replay'}
            onClick={props.onClickReplyEmail}
            status={props.buttonReplyStatus}
          />
          <i
            className="icon-dots"
            onClick={ev => props.onTogglePopOverEmailActions(ev)}
          >
            <PopOverEmailActions
              isHidden={props.isHiddenPopOverEmailActions}
              isSpam={props.isSpam}
              isTrash={props.isTrash}
              isFromMe={props.isFromMe}
              hasBoundary={!!props.email.boundary}
              menuPosition={{ right: '-32px', top: '28px' }}
              onReplyEmail={props.onReplyEmail}
              onReplyAll={props.onReplyAll}
              onForward={props.onForward}
              onMarkAsSpam={props.onMarkAsSpam}
              onMarkUnread={props.onMarkUnread}
              onDelete={props.onDelete}
              onDeletePermanently={props.handleClickPermanentlyDeleteEmail}
              onToggleMenu={props.onTogglePopOverEmailActions}
              onOpenEmailSource={props.onOpenEmailSource}
              onPrintEmail={props.onPrintEmail}
              onReportPhishing={props.onReportPhishing}
            />
          </i>
        </div>
      )}
    </div>
  </div>
);

const showContacts = contacts => {
  return contacts.reduce((result, contact, index) => {
    if (contacts.length > 1) {
      const name = contact.name || contact.email.split('@')[0];
      const firstname = `${index !== 0 ? ', ' : ''}${name.split(' ')[0]}`;
      return `${result}${firstname}`;
    }
    return `${result} ${contact.name || contact.email}`;
  }, '');
};

const renderEmailStatus = status => {
  return <div className="email-status">{defineEmailStatus(status)}</div>;
};

const renderIcons = (
  fileTokens,
  isSecure,
  onMouseEnterTooltip,
  onMouseLeaveTooltip,
  id
) => {
  return (
    <div className="email-info-content-detail-icons">
      {!!fileTokens.length && <i className="icon-attach" />}
      {isSecure &&
        renderIconSecure(onMouseEnterTooltip, onMouseLeaveTooltip, id)}
    </div>
  );
};

const renderIconSecure = (onMouseEnterTooltip, onMouseLeaveTooltip, id) => {
  return (
    <div
      data-tip
      data-for={`securetip${id}`}
      onMouseEnter={() => {
        onMouseEnterTooltip(`securetip${id}`);
      }}
      onMouseLeave={() => {
        onMouseLeaveTooltip(`securestip${id}`);
      }}
    >
      <i className="icon-secure" />
    </div>
  );
};

const theMail = props => {
  const { content, blockImagesInline } = props;
  if (!blockImagesInline)
    return `<div class="email-container">${content}</div>`;
  return getDOM(content);
};

const getDOM = html => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(
    `<div class="email-container">${html}</div>`,
    'text/html'
  );
  const allImages = [...doc.getElementsByTagName('img')];
  // eslint-disable-next-line prefer-const
  for (let i = 0; i < allImages.length; i++) {
    const img = allImages[i];
    const originalHeight = img.height;
    const originalWidth = img.width;
    const el = doc.createElement('div');
    el.innerHTML = `<div style='height: ${originalHeight}px; width: ${originalWidth}px; min-width: 18px; min-height: 18px; border: solid 1px #bfc3c8;'>
                      <svg style='max-height: 25%; max-width: 25%;'  viewBox="0 0 16 15" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
                        <title>Group 3</title>
                        <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                          <g id="BRC-Desktop" transform="translate(-296.000000, -210.000000)" fill="#BFC3C8">
                            <g id="Group" transform="translate(296.000000, 210.000000)">
                              <g id="Group-3">
                                <path d="M7.90386809,13.0000855 L2.56152307,13.0000855 C2.08180568,13.0000855 1.86804559,12.6544802 2.08429126,12.2280413 L5.06699009,6.34697814 C5.28323575,5.9205392 5.6950139,5.88177203 5.98665556,6.26119545 L8.98592494,10.1634829 C9.2775666,10.5429064 9.78711099,10.5750749 10.1251502,10.2352435 L10.858397,9.49536778 C11.1956077,9.15553636 11.6918956,9.19760287 11.9677952,9.58857397 L13.8676087,12.2907287 C14.1418513,12.6825246 13.9761458,13.0000855 13.4964284,13.0000855 L7.90386809,13.0000855 Z M12.9999145,5.0000855 C12.9999145,6.10399398 12.103823,7.0000855 10.9999145,7.0000855 C9.89505273,7.0000855 8.9999145,6.10399398 8.9999145,5.0000855 C8.9999145,3.89617702 9.89505273,3.0000855 10.9999145,3.0000855 C12.103823,3.0000855 12.9999145,3.89617702 12.9999145,5.0000855 Z M1.80972598,8.55e-05 C0.811496627,8.55e-05 -8.55e-05,0.810963882 -8.55e-05,1.81101944 L-8.55e-05,13.1916517 C-8.55e-05,14.1900405 0.811496627,15.0000855 1.80972598,15.0000855 L14.1909363,15.0000855 C15.1883324,15.0000855 15.9999145,14.1900405 15.9999145,13.1916517 L15.9999145,1.81101944 C15.9999145,0.810963882 15.1891656,8.55e-05 14.1909363,8.55e-05 L1.80972598,8.55e-05 Z" id="Fill-1"></path>
                              </g>
                            </g>
                          </g>
                        </g>
                      </svg>
                    </div>`;
    img.insertAdjacentElement('afterend', el);
    img.remove();
  }
  return `<div class="email-container">${new XMLSerializer().serializeToString(
    doc
  )}</div>`;
};

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

const defineEmailType = (isUnsend, isDraft, isEmpty) => {
  if (isUnsend) {
    return 'email-unsend';
  } else if (isDraft) {
    return 'email-draft';
  } else if (isEmpty) {
    return 'email-empty';
  }
  return 'email-normal';
};

const isExpand = (displayEmail, staticOpen) => {
  return displayEmail || staticOpen;
};

renderEmailInfoExpand.propTypes = {
  borderUrl: PropTypes.string,
  buttonReplyStatus: PropTypes.number,
  buttonUnsendStatus: PropTypes.number,
  dateLong: PropTypes.string,
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
  onClickReplyEmail: PropTypes.func,
  onClickUnsendButton: PropTypes.func,
  onDelete: PropTypes.func,
  onDeletePermanently: PropTypes.func,
  onForward: PropTypes.func,
  onMarkAsSpam: PropTypes.func,
  onMarkUnread: PropTypes.func,
  onOpenEmailSource: PropTypes.func,
  onPrintEmail: PropTypes.func,
  onReplyEmail: PropTypes.func,
  onReplyAll: PropTypes.func,
  onReportPhishing: PropTypes.func,
  onTogglePopOverEmailActions: PropTypes.func,
  onTooglePopOverEmailMoreInfo: PropTypes.func
};

Email.propTypes = {
  avatarUrl: PropTypes.string,
  blockImagesInline: PropTypes.bool,
  blockImagesContact: PropTypes.bool,
  blockImagesAccount: PropTypes.bool,
  borderUrl: PropTypes.string,
  color: PropTypes.string,
  content: PropTypes.string,
  date: PropTypes.string,
  dismissPopup: PropTypes.func,
  displayEmail: PropTypes.bool,
  email: PropTypes.object,
  files: PropTypes.array,
  handleClickPermanentlyDeleteEmail: PropTypes.func,
  handlePopupConfirm: PropTypes.func,
  hideView: PropTypes.bool,
  isDraft: PropTypes.bool,
  isEmpty: PropTypes.bool,
  isUnsend: PropTypes.bool,
  letters: PropTypes.string,
  onForward: PropTypes.func,
  onMouseEnterTooltip: PropTypes.func,
  onMouseLeaveTooltip: PropTypes.func,
  onReplyAll: PropTypes.func,
  onReplyLast: PropTypes.func,
  onToggleEmail: PropTypes.func,
  popupContent: PropTypes.object,
  popupContentBlockRemoteContent: PropTypes.object,
  handlePopupConfirmBlock: PropTypes.func,
  preview: PropTypes.string,
  staticOpen: PropTypes.bool,
  isHiddenPopOverEmailBlocked: PropTypes.bool,
  onTogglePopOverEmailBlocked: PropTypes.func
};

export default Email;
