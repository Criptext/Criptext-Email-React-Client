import { connect } from 'react-redux';
import { addLabel } from '../actions';
import LabelAddWrapper from '../components/LabelAddWrapper';
import randomcolor from 'randomcolor';

const mapDispatchToProps = dispatch => {
  return {
    onAddLabel: text => {
      const color = randomcolor({
        seed: text,
        luminosity: 'bright'
      });
      const label = {
        text,
        color: color.replace('#', ''),
        visible: true
      };
      dispatch(addLabel(label));
    }
  };
};

const LabelAdd = connect(
  null,
  mapDispatchToProps
)(LabelAddWrapper);

export default LabelAdd;
