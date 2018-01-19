import { connect } from 'react-redux';
import { loadLabels } from '../actions';
import SideBarView from '../components/SideBar';

const mapStateToProps = (state, ownProps) => {
  return {
    labels: state.get('labels'),
    optionSelected: ownProps.location.pathname.replace('/', '')
  };
};

const mapDispatchToProps = dispatch => {
  return {
    onLoadLabels: () => {
      dispatch(loadLabels(dispatch));
    }
  };
};

const SideBar = connect(mapStateToProps, mapDispatchToProps)(SideBarView);

export default SideBar;
