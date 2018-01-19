import { connect } from 'react-redux';
import EmailView from '../components/EmailWrapper';
import * as TimeUtils from '../utils/TimeUtils';

const mapStateToProps = (state, ownProps) => {
  const email = ownProps.email;
  const myEmail = email.merge({
    date: TimeUtils.defineTimeByToday(email.get('date'))
  });
  return {
    email: myEmail
  };
};

const Email = connect(mapStateToProps, null)(EmailView);

export default Email;
