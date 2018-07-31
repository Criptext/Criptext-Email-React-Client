import { connect } from 'react-redux';
import randomcolor from 'randomcolor';
import SettingsWrapper from './../components/SettingsWrapper';
import { addLabel, updateLabel, removeLabel } from './../actions';
import {
  myAccount,
  updateAccount,
  LabelType
} from '../utils/electronInterface';

const defineSystemLabels = labelsArray => {
  return labelsArray.filter(label => {
    const isStarred = label.id === LabelType.starred.id;
    return isStarred;
  });
};

const defineCustomLabels = labelsArray => {
  return labelsArray.filter(label => label.type === 'custom');
};

const mapStateToProps = state => {
  const labels = state.get('labels').toJS();
  const labelsArray = Object.values(labels);
  const systemLabels = defineSystemLabels(labelsArray);
  const customLabels = defineCustomLabels(labelsArray);
  return {
    systemLabels,
    customLabels
  };
};

const mapDispatchToProps = dispatch => {
  return {
    onAddLabel: text => {
      const color = randomcolor({
        seed: text,
        luminosity: 'bright'
      });
      const label = {
        text,
        color,
        visible: true
      };
      dispatch(addLabel(label));
    },
    onUpdateAccount: async params => {
      const accountParams = { ...params, recipientId: myAccount.recipientId };
      await updateAccount(accountParams);
    },
    onUpdateLabel: params => {
      dispatch(updateLabel(params));
    },
    onRemoveLabel: labelId => {
      dispatch(removeLabel(String(labelId)));
    }
  };
};

const Settings = connect(
  mapStateToProps,
  mapDispatchToProps
)(SettingsWrapper);

export default Settings;
