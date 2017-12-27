import { connect } from 'react-redux'
import { loadEmails } from '../actions'
import EmailsView from '../components/Emails'

const emailsArray = (emailsMap, emailsId) => {
  return emailsId.map( emailId => {
    return emailsMap.get(`${emailId}`) ? emailsMap.get(`${emailId}`).toObject() : {};    
  });
}

const mapStateToProps = (state, ownProps) => {
  return {
    emails: emailsArray(state.get('emails'), ownProps.emails)
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    onLoadEmails: () => {
      dispatch(loadEmails(dispatch))
    }
  }
}

const Emails = connect(
  mapStateToProps,
  mapDispatchToProps
)(EmailsView)

export default Emails
