import { connect } from 'react-redux';
import { addLabel } from '../actions';
import LabelEditView from '../components/LabelEdit';

const mapDispatchToProps = dispatch => {
  return {
    onAddLabel: label => {
      dispatch(addLabel(label));
    }
  };
};

const LabelEdit = connect(null, mapDispatchToProps)(LabelEditView);

export default LabelEdit;
