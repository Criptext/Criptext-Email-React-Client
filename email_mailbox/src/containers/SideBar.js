import { connect } from 'react-redux';
import { loadLabels } from '../actions';
import SideBarView from '../components/SideBar';

const defineLabels = labels => {
  return labels
    .valueSeq()
    .filter(element => element.get('id') > 7 || element.get('id') === 4);
};

const mapStateToProps = state => {
  return {
    labels: defineLabels(state.get('labels'))
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
