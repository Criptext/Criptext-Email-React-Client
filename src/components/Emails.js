import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Email from './Email'

class Emails extends Component {
  render() {
    return (
      <div>
        {this.props.emails.map((email, index) => {
            return <Email key={index} email={email} />
          })
        }
      </div>
    )
  }
  
  componentDidMount() {
    this.props.onLoadEmails();
  }
}

Emails.propTypes = {
  emails: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number,
    subject: PropTypes.string,
    preview: PropTypes.string,
    content: PropTypes.string
  }))
}

export default Emails
