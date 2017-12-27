import React from 'react'
import PropTypes from 'prop-types'

const Email = props => (
  <div>
    <h1>{props.email.subject}</h1>
    <span>{props.email.preview}</span>
    <p>{props.email.content}</p>
  </div>
)

Email.propTypes = {
  email: PropTypes.shape({
    id: PropTypes.number,
    subject: PropTypes.string,
    preview: PropTypes.string,
    content: PropTypes.string
  })
}

export default Email
