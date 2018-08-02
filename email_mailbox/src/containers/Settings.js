import { connect } from 'react-redux';
import randomcolor from 'randomcolor';
import SettingsWrapper from './../components/SettingsWrapper';
import { addLabel, updateLabel, removeLabel } from './../actions';
import {
  myAccount,
  updateAccount,
  LabelType,
  updateNameEvent
} from '../utils/electronInterface';
import { SocketCommand } from '../utils/const';

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
    onAddLabel: (text, eventParams) => {
      if (eventParams) {
        const isByEvent = true;
        dispatch(addLabel(eventParams, isByEvent));
      } else {
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
      }
    },
    onUpdateAccount: async params => {
      const recipientId = myAccount.recipientId;
      const { name } = params;
      if (name) {
        const { status } = await updateNameEvent({
          cmd: SocketCommand.PEER_USER_NAME_CHANGED,
          params: { name }
        });
        if (status === 200) {
          await updateAccount({ ...params, recipientId });
        }
      } else {
        await updateAccount({ ...params, recipientId });
      }
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
