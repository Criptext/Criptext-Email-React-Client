import { connect } from 'react-redux';
import SettingsGeneralProfileWrapper from './../components/SettingsGeneralProfileWrapper';
import { setAvatarUpdatedTimestamp } from './../actions';
import { myAccount } from '../utils/electronInterface';
import {
  removeAvatar,
  updateAccount,
  updateContactByEmail,
  updateNameEvent,
  uploadAvatar
} from './../utils/ipc';
import { appDomain, avatarBaseUrl } from '../utils/const';

const mapStateToProps = state => {
  const avatarTimestamp = state.get('activities').get('avatarTimestamp');
  const [username, domain = appDomain] = myAccount.recipientId.split(`@`);
  const avatarUrl = `${avatarBaseUrl}${domain}/${username}?date=${avatarTimestamp}`;
  return {
    avatarUrl
  };
};

const mapDispatchToProps = dispatch => {
  return {
    onRemoveAvatar: async () => {
      const { status } = await removeAvatar();
      dispatch(setAvatarUpdatedTimestamp(Date.now()));
      return status;
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
      const email = myAccount.recipientId.includes('@')
        ? myAccount.recipientId
        : `${myAccount.recipientId}@${appDomain}`;
      await updateContactByEmail({ email, name });
    },
    onUploadAvatar: async params => {
      const { status } = await uploadAvatar(params);
      dispatch(setAvatarUpdatedTimestamp(Date.now()));
      return status;
    }
  };
};

const SettingsGeneralProfile = connect(
  mapStateToProps,
  mapDispatchToProps
)(SettingsGeneralProfileWrapper);

export default SettingsGeneralProfile;
