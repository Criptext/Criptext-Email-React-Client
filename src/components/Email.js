import React from 'react';
import PropTypes from 'prop-types';
import './email.css';

const Email = props => (
   props.isOpen ?
    <div className="email-container email-container-expand">
      <div className="email-info">
        <div className="email-icon-letter"><span>DM</span></div>
        <div className="email-header-info">
          <span>{props.email.get('from')}</span>
          <span>Allison, Daniel, Gabriel, 2 others</span>
        </div>
        <div className="email-detail-info">
          <span>{props.email.get('date')}</span>
          <i className="icon-bell"></i>
          <i className="icon-bell"></i>
          <i className="icon-dots"></i>
        </div>
      </div>
      <div className="email-body">
        <div className="email-options">
          <div><i className="icon-attach"></i></div>
          <div><i className="icon-checked"></i></div>
          <button className="button-a button-unsend"><i className="icon-sent"/><span>unsend</span></button>
        </div>
        <div className="email-text">
        <p>Lorem Ipsum is simply dummy text of the printing and</p>
        </div>
      </div>
    </div>
    : <div className="email-container email-container-collapse">
    <span className="email-from">{props.email.get('from')}</span>
    <span className="email-preview-content">Lorem Ipsum is simply dummy text of the printing and</span>
    <div />
    <span className="email-date">{props.email.get('date')}</span>
  </div>
);

Email.propTypes = {
  email: PropTypes.object
};

export default Email;
