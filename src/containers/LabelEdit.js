import { connect } from 'react-redux';
import { loadLabels, addLabel } from '../actions';
import LabelEditView from '../components/LabelEdit';

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    onAddLabel: label => {
      console.log(label);
      dispatch(addLabel(label));
    }
  };
};

const LabelEdit = connect(null, mapDispatchToProps)(LabelEditView);

export default LabelEdit;
