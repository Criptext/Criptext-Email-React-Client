import { connect } from 'react-redux';
import { updateLabel } from '../actions';
import SideBarLabelItemView from '../components/SideBarLabelItemWrapper';

const mapStateToProps = (state, ownProps) => {
  return {
    label: ownProps.label.toJS()
  };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    onUpdateLabel: text => {
      dispatch(updateLabel({ id: ownProps.label.get('id'), text }));
    }
  };
};

const SideBarLabelItem = connect(
  mapStateToProps,
  mapDispatchToProps
)(SideBarLabelItemView);

export default SideBarLabelItem;
