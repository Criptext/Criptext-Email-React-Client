import { connect } from 'react-redux';
import { loadLabels } from '../actions';
import SideBarView from '../components/SideBar';

const mapStateToProps = state => {
  return {
    labels: state.get('labels')
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
