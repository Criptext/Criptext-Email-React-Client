import { connect } from 'react-redux';
import SideBarView from '../components/SideBarWrapper';
import { getSystemLabels, getVisibleLabels } from '../selectors/labels';
import {
  SectionType,
  composerEvents,
  formInviteFriendEmailContent,
  SEND_BUTTON_STATUS
} from './../utils/const';
import { openFilledComposerWindow } from './../utils/ipc';
import { getAllAccounts } from '../selectors/accounts';
import { myAccount } from '../utils/electronInterface';
import { canUpgrade } from '../utils/plus';

const mapStateToProps = state => {
  const accounts = getAllAccounts(state);
  const activeAccount = accounts.find(
    acc => acc.recipientId === myAccount.recipientId
  );

  return {
    items: getSystemLabels(state),
    labels: getVisibleLabels(state),
    canUpgrade: canUpgrade(activeAccount.customerType)
  };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    onClickInviteFriend: () => {
      openFilledComposerWindow({
        type: composerEvents.NEW_WITH_DATA,
        data: {
          email: {
            subject: 'Hey, try Criptext now!',
            content: formInviteFriendEmailContent()
          },
          status: SEND_BUTTON_STATUS.DISABLED
        }
      });
    },
    onClickSettings: params => {
      const type = SectionType.SETTINGS;
      ownProps.onClickSection(type, params);
    }
  };
};

const SideBar = connect(mapStateToProps, mapDispatchToProps)(SideBarView);

export default SideBar;
