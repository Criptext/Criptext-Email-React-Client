import { connect } from 'react-redux';
import { addUser } from './../actions/index';
import SignUpWrapper from './../components/SignUpWrapper';

const mapStateToProps = () => {
  return {};
};

const mapDispatchToProps = dispatch => {
  return {
    onAddUser: user => {
      dispatch(addUser(user));
    }
  };
};

const SignUp = connect(mapStateToProps, mapDispatchToProps)(SignUpWrapper);

export default SignUp;
