import { connect } from 'react-redux';
import { addLabel } from '../actions';
import LabelEditView from '../components/LabelEdit';

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    onAddLabel: label => {
      dispatch(addLabel(label));
    }
  };
};

const LabelEdit = connect(null, mapDispatchToProps)(LabelEditView);

export default LabelEdit;
