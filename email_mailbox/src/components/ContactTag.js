import React from 'react';
import PropTypes from 'prop-types';
import './contacttag.css';

const ContactTag = props => (
  <span className="contact-tag">
    {props.contact.name ? (
      <span className="name">{props.contact.name}</span>
    ) : null}
    <span className="tag">{`<${props.contact.email}>`}</span>
  </span>
);

ContactTag.propTypes = {
  contact: PropTypes.object
};

export default ContactTag;
