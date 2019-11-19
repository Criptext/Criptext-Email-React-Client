import { connect } from 'react-redux';
import randomcolor from 'randomcolor';
import { addLabel } from '../actions';
import LabelAddWrapper from '../components/LabelAddWrapper';
import { mySettings } from '../utils/electronInterface';
import { generateLabelUUID } from '../utils/ipc';

const mapDispatchToProps = dispatch => {
  return {
    onAddLabel: async text => {
      const color = randomcolor({
        seed: text,
        luminosity: mySettings.theme === 'dark' ? 'dark' : 'bright'
      });
      const uuid = await generateLabelUUID();
      const label = {
        text,
        color: color.replace('#', ''),
        visible: true,
        uuid
      };
      dispatch(addLabel(label));
    }
  };
};

const LabelAdd = connect(null, mapDispatchToProps)(LabelAddWrapper);

export default LabelAdd;
