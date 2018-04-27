import React from 'react';
import PropTypes from 'prop-types';
import AttachItem, { AttachItemStatus } from './AttachItem';
import ButtonExpand, { ButtonExpandType } from './ButtonExpandWrapper';
import ButtonUnsend from './ButtonUnsendWrapper';
import './email.css';

const Email = props =>
  props.displayEmail || props.staticOpen
    ? renderEmailExpand(props)
    : renderEmailCollapse(props);

const renderEmailCollapse = props => (
  <div
    className={`email-container email-container-collapse ${props.classStatus}`}
    onClick={props.onToggleEmail}
  >
    <span className="email-preview-from">{showContacts(props.email.from)}</span>
    <span className="email-preview-content">{props.email.preview}</span>
    <div className="email-preview-info">
      <i className="icon-attach" />
      <i className="icon-checked" />
    </div>
    <span className="email-preview-date">{props.email.date}</span>
  </div>
);

const renderEmailExpand = props => (
  <div>
    <div className="email-container email-container-expand">
      <div className="email-info" onClick={props.onToggleEmail}>
        <div
          style={{ background: props.email.color }}
          className="email-icon-letter"
        >
          <span>{props.email.letters}</span>
        </div>
        <div className="email-header-info">
          <span className="email-header-info-from">
            {showContacts(props.email.from)}
          </span>
          <div>
            <span className="email-header-info-to">
              {`to: ${showContacts(props.email.to)}`}
            </span>
            <i
              className="icon-arrow-down"
              onClick={props.onTooglePopOverEmailDetail}
            >
              {props.displayPopOverEmailDetail
                ? renderPopOverEmailDetail(props.email)
                : null}
            </i>
          </div>
        </div>
        <div className="email-detail-info">
          <span>{props.email.date}</span>
          {props.isFromMe ? renderMuteIcon(props) : null}
          <i className="icon-replay" onClick={ev => props.onReplyEmail(ev)} />
          <i
            id="email-more"
            className="icon-dots"
            onClick={ev => props.onTogglePopOverMenuAction(ev)}
          />
          {props.displayPopOverMenuAction
            ? renderPopOverMenuAction(props)
            : null}
        </div>
      </div>
      <hr />
      <div className="email-body">
        <div className="email-options">
          {props.attachments.length ? (
            <ButtonExpand
              icon="icon-attach"
              info="Sheep Relevance.doc"
              title="Last Opened: "
              text="3:20PM"
              status={ButtonExpandType.NORMAL}
              renderList={renderAttachLastOpenedList}
            />
          ) : null}
          {props.isFromMe ? (
            <ButtonExpand
              icon="icon-checked"
              title="Last Opened: "
              text="3:20PM"
              status={ButtonExpandType.NORMAL}
              renderList={renderLastOpenedList}
            />
          ) : null}
          {props.isUnsend ? (
            <ButtonExpand
              icon="icon-unsend"
              title="Unsent: "
              text="3:20PM"
              status={ButtonExpandType.UNSENT}
            />
          ) : null}
          {props.isFromMe && !props.isUnsend ? (
            <ButtonUnsend onClicked={props.unsendButtonOnClicked} />
          ) : null}
        </div>
        <div disabled={props.hideView} className="email-text">
          <div dangerouslySetInnerHTML={{ __html: props.email.content }} />
        </div>
        {props.attachments.length ? (
          <div disabled={props.hideView} className="email-attachs">
            {props.attachments.map((attachment, index) => {
              return (
                <AttachItem
                  key={index}
                  status={AttachItemStatus.UNSENT}
                  attachment={attachment}
                />
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

const renderPopOverEmailDetail = props => (
  <div className="email-more-detail">
    <table>
      <tbody>
        <tr>
          <td>
            <span className="title">From:</span>
          </td>
          <td>
            {props.from.map((contact, index) => {
              return <ContactTag key={index} contact={contact} />;
            })}
          </td>
        </tr>
        <tr>
          <td>
            <span className="title">To:</span>
          </td>
          <td>
            {props.to.map((contact, index) => {
              return <ContactTag key={index} contact={contact} />;
            })}
          </td>
        </tr>
        <tr>
          <td>
            <span className="title">Date:</span>
          </td>
          <td>
            <span className="text">{props.date}</span>
          </td>
        </tr>
        <tr>
          <td>
            <span className="title">Subject:</span>
          </td>
          <td>
            <span className="text">{props.subject}</span>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
);

const renderPopOverMenuAction = props => (
  <div className="email-more-menu">
    <ul>
      <li
        onClick={ev => {
          props.onReplyEmail(ev);
          props.onTogglePopOverMenuAction(ev);
        }}
      >
        <span>Reply</span>
      </li>
      <li
        onClick={ev => {
          props.onReplyAll(ev);
          props.onTogglePopOverMenuAction(ev);
        }}
      >
        <span>Reply All</span>
      </li>
      <li
        onClick={ev => {
          props.onForward(ev);
          props.onTogglePopOverMenuAction(ev);
        }}
      >
        <span>Forward</span>
      </li>
      <li>
        <span>Delete</span>
      </li>
      <li>
        <span>Mark as Unread</span>
      </li>
      <li>
        <span>Mark as Spam</span>
      </li>
      <li>
        <span>Print</span>
      </li>
    </ul>
  </div>
);

const renderLastOpenedList = () => (
  <ul className="email-popover-lastopened">
    <li>
      <span>Gianni Carlo</span>
      <span>3:20 PM</span>
    </li>
    <li>
      <span>Gianni Carlo</span>
      <span>3:20 PM</span>
    </li>
    <li>
      <span>Gianni Carlo</span>
      <span>3:20 PM</span>
    </li>
  </ul>
);

const renderAttachLastOpenedList = () => (
  <ul className="email-popover-lastopened">
    <li>
      <div>
        <div className="icon-pdf" />
        <span>Look at ma Sheep.pdf</span>
      </div>
      <div>
        <span className="title">Dowloaded:</span>
        <span>3:20 PM</span>
      </div>
    </li>
    <li>
      <div>
        <div className="icon-pdf" />
        <span>Look at ma Sheep.pdf</span>
      </div>
      <div>
        <span className="title">Opened:</span>
        <span>Yesterday</span>
      </div>
    </li>
    <li>
      <div>
        <div className="icon-pdf" />
        <span>Look at ma Sheep.pdf</span>
      </div>
      <div>
        <span className="title">Dowloaded:</span>
        <span>Jul 22</span>
      </div>
    </li>
  </ul>
);

const ContactTag = props => (
  <span>
    {props.contact.name ? (
      <span className="text">{props.contact.name}</span>
    ) : null}
    <span className="tag-text">{`<${props.contact.email}>`}</span>
  </span>
);

const renderMuteIcon = props => (
  <i
    className={props.email.isMuted ? 'icon-bell-mute' : 'icon-bell'}
    onClick={ev => props.toggleMute(ev)}
  />
);

renderEmailCollapse.propTypes = {
  classStatus: PropTypes.string,
  email: PropTypes.object,
  onToggleEmail: PropTypes.func
};

renderEmailExpand.propTypes = {
  attachments: PropTypes.array,
  displayPopOverEmailDetail: PropTypes.bool,
  displayPopOverMenuAction: PropTypes.bool,
  email: PropTypes.object,
  hideView: PropTypes.bool,
  isFromMe: PropTypes.bool,
  isUnsend: PropTypes.bool,
  onForward: PropTypes.func,
  onReplyAll: PropTypes.func,
  onReplyEmail: PropTypes.func,
  onReplyLast: PropTypes.func,
  onToggleEmail: PropTypes.func,
  onTooglePopOverEmailDetail: PropTypes.func,
  onTogglePopOverMenuAction: PropTypes.func,
  staticOpen: PropTypes.func,
  unsendButtonOnClicked: PropTypes.func
};

renderPopOverEmailDetail.propTypes = {
  date: PropTypes.string,
  from: PropTypes.array,
  subject: PropTypes.string,
  to: PropTypes.array
};

renderPopOverMenuAction.propTypes = {
  onForward: PropTypes.func,
  onReplyAll: PropTypes.func,
  onReplyEmail: PropTypes.func,
  onTogglePopOverMenuAction: PropTypes.func
};

ContactTag.propTypes = {
  contact: PropTypes.object
};

renderMuteIcon.propTypes = {
  email: PropTypes.object,
  toggleMute: PropTypes.func
};

Email.propTypes = {
  email: PropTypes.object
};

export default Email;
