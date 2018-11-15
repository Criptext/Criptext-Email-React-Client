import React from 'react';
import PropTypes from 'prop-types';
import './contacttag.scss';

const ContactTag = props => (
  <span className="contact-tag">
    {props.contact.name ? (
      <span className="name">{`${props.contact.name} `}</span>
    ) : null}
    <span className="tag">{`<${props.contact.email}>`}</span>
    {!props.isLast ? <br /> : null}
  </span>
);

ContactTag.propTypes = {
  contact: PropTypes.object,
  isLast: PropTypes.bool
};

export default ContactTag;
