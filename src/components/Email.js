import React from 'react';
import PropTypes from 'prop-types';

const Email = props => (
  <div>
    <span>{props.email.get('from')}</span>
    <span>"Lorem Ipsum is simply dummy text of the printing and"</span>
    <div />
    <span>{props.email.get('date')}</span>
  </div>
);

Email.propTypes = {
  email: PropTypes.object
};

export default Email;
