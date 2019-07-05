import React from 'react';
import PropTypes from 'prop-types';
import './contacttag.scss';

const ContactTag = props => (
  <span className="contact-tag">
    {props.contact.name ? (
      <span className="name">{`${props.contact.name} `}</span>
    ) : null}
    <a className="tag" href={`mailto:${props.contact.email}`}>
      {props.contact.email}
    </a>
    {!props.isLast ? <br /> : null}
  </span>
);

ContactTag.propTypes = {
  contact: PropTypes.object,
  isLast: PropTypes.bool
};

export default ContactTag;
