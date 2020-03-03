import { connect } from 'react-redux';
import randomcolor from 'randomcolor';
import SettingsWrapper from './../components/SettingsWrapper';
import { getCustomeLabels, getSystemLabelToEdit } from './../selectors/labels';
import { addLabel } from './../actions';
import { myAccount, mySettings } from '../utils/electronInterface';
import {
  resendConfirmationEmail,
  updateAccount,
  updateContactByEmail,
  updateNameEvent,
  setReadTracking,
  checkForUpdates,
  generateLabelUUID
} from './../utils/ipc';

const mapStateToProps = state => {
  const systemLabels = getSystemLabelToEdit(state);
  const customLabels = getCustomeLabels(state);
  return {
    systemLabels,
    customLabels
  };
};

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
    },
    onResendConfirmationEmail: async () => {
      return await resendConfirmationEmail();
    },
    onUpdateAccount: async params => {
      const recipientId = myAccount.recipientId;
      const { name } = params;
      if (name) {
        const res = await updateNameEvent(params);
        if (res.status === 200) {
          await updateAccount({ ...params, recipientId });
        }
      } else {
        await updateAccount({ ...params, recipientId });
      }
    },
    onUpdateContact: async name => {
      const email = myAccount.email;
      await updateContactByEmail({ email, name });
    },
    onSetReadReceiptsTracking: async enabled => {
      const { status } = await setReadTracking(enabled);
      return status;
    },
    onCheckForUpdates: () => {
      checkForUpdates();
    }
  };
};

const Settings = connect(mapStateToProps, mapDispatchToProps)(SettingsWrapper);

export { Settings as default };
