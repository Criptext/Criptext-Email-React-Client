import { connect } from 'react-redux';
import { signUpUser } from './../actions/index';
import SignUpWrapper from './../components/SignUpWrapper';

const mapStateToProps = () => {
  return {};
};

const mapDispatchToProps = () => {
  return {
    onAddUser: user => signUpUser(user)
  };
};

const SignUp = connect(mapStateToProps, mapDispatchToProps)(SignUpWrapper);

export default SignUp;
