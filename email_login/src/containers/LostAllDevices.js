import { connect } from 'react-redux';
import { loginUser } from './../actions/index';
import LostAllDevicesWrapper from './../components/LostAllDevicesWrapper';

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
  LostAllDevicesWrapper
);

export default LostDevices;
