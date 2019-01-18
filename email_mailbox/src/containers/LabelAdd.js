import { connect } from 'react-redux';
import { addLabel } from '../actions';
import LabelAddWrapper from '../components/LabelAddWrapper';
import randomcolor from 'randomcolor';
import { mySettings } from '../utils/electronInterface';

const mapDispatchToProps = dispatch => {
  return {
    onAddLabel: text => {
      const color = randomcolor({
        seed: text,
        luminosity: mySettings.theme === 'dark' ? 'dark' : 'bright'
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
