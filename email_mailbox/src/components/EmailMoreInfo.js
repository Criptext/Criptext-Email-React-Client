import React from 'react';
import PropTypes from 'prop-types';
import ContactTag from './ContactTag';
import './emailmoreinfo.css';

const EmailMoreInfo = props => (
  <div className="email-more-detail" onClick={ev => ev.stopPropagation()}>
    <table>
      <tbody>
        {renderContacts('From:', props.from)}
        {renderContacts('To:', props.to)}
        {props.cc.length ? renderContacts('Cc:', props.cc) : null}
        {props.bcc.length ? renderContacts('Bcc:', props.bcc) : null}
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
        <tr>
          <td>
            <span className="title">Security:</span>
          </td>
          <td>
            <span className="text">TLS - Standard Encryption</span>
          </td>
        </tr>
        <tr>
          <td>
            <span className="title">Mailed-by:</span>
          </td>
          <td>
            <span className="text">protonmail.com</span>
          </td>
        </tr>
        <tr>
          <td>
            <span className="title">Signed-by:</span>
          </td>
          <td>
            <span className="text">protonmail.com</span>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
);

const renderContacts = (text, contacts) => {
  return (
    <tr>
      <td>
        <span className="title">{text}</span>
      </td>
      <td>
        <span>
          {contacts.map((contact, index) => {
            const isLast = contacts.length - 1 === index;
            return <ContactTag key={index} contact={contact} isLast={isLast} />;
          })}
        </span>
      </td>
    </tr>
  );
};

EmailMoreInfo.propTypes = {
  bcc: PropTypes.array,
  cc: PropTypes.array,
  date: PropTypes.string,
  from: PropTypes.array,
  subject: PropTypes.string,
  to: PropTypes.array
};

export default EmailMoreInfo;
