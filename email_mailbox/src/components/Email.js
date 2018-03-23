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
          <i className="icon-bell" />
          <i className="icon-replay" />
          <i
            id="email-more"
            className="icon-dots"
            onClick={props.onTogglePopOverMenuAction}
          />
          {props.displayPopOverMenuAction ? renderPopOverMenuAction() : null}
        </div>
      </div>
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
    <div className="email-segment-controls">
      <div>
        <i className="icon-replay" />
        <span>Replay</span>
      </div>
      <div>
        <i className="icon-replay-all" />
        <span>Replay All</span>
      </div>
      <div>
        <i className="icon-forward" />
        <span>Forward</span>
      </div>
    </div>
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

const renderPopOverMenuAction = () => (
  <div className="email-more-menu">
    <ul>
      <li>
        <span>Replay</span>
      </li>
      <li>
        <span>Replay All</span>
      </li>
      <li>
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
  onToggleEmail: PropTypes.func,
  onTooglePopOverEmailDetail: PropTypes.func,
  onTogglePopOverMenuAction: PropTypes.func,
  unsendButtonOnClicked: PropTypes.func
};

renderPopOverEmailDetail.propTypes = {
  date: PropTypes.string,
  from: PropTypes.array,
  subject: PropTypes.string,
  to: PropTypes.array
};

ContactTag.propTypes = {
  contact: PropTypes.object
};

Email.propTypes = {
  email: PropTypes.object
};

export default Email;
