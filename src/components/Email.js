import React from 'react'
import PropTypes from 'prop-types'

const Email = props => (
  <div>
    <h1>{props.email.get(subject.toString())}</h1>
    <span>{props.email.get(preview.toString())}</span>
    <p>{props.email.get(content.toString())}</p>
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
