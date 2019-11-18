import { connect } from 'react-redux';
import { updateLabel } from '../actions';
import SideBarLabelItemView from '../components/SideBarLabelItemWrapper';

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    onUpdateLabel: text => {
      dispatch(updateLabel({ id: ownProps.id, text, uuid: ownProps.uuid }));
    }
  };
};

const SideBarLabelItem = connect(null, mapDispatchToProps)(
  SideBarLabelItemView
);

export default SideBarLabelItem;
