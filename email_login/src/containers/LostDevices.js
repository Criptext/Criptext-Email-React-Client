import { connect } from 'react-redux';
import { loginUser } from './../actions/index';
import LostDevicesWrapper from './../components/LostDevicesWrapper';

const mapStateToProps = () => {
  return {};
};

const mapDispatchToProps = dispatch => {
  return {
    onLoginUser: user => {
      dispatch(loginUser(user));
    }
  };
};

const LostDevices = connect(mapStateToProps, mapDispatchToProps)(
  LostDevicesWrapper
);

export default LostDevices;
