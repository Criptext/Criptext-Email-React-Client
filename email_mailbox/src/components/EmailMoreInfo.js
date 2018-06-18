import React from 'react';
import PropTypes from 'prop-types';
import ContactTag from './ContactTag';
import './emailmoreinfo.css';

const EmailMoreInfo = props => (
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

EmailMoreInfo.propTypes = {
  date: PropTypes.string,
  from: PropTypes.array,
  subject: PropTypes.string,
  to: PropTypes.array
};

export default EmailMoreInfo;
