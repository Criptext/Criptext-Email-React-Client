import { connect } from 'react-redux';
import { updateLabel } from '../actions';
import SideBarLabelItemView from '../components/SideBarLabelItemWrapper';

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    onUpdateLabel: text => {
      dispatch(updateLabel({ id: ownProps.label.id, text }));
    }
  };
};

const SideBarLabelItem = connect(mapDispatchToProps)(SideBarLabelItemView);

export default SideBarLabelItem;
