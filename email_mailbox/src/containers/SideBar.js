import { connect } from 'react-redux';
import SideBarView from '../components/SideBarWrapper';
import { getSystemLabels, getVisibleLabels } from '../selectors/labels';
import {
  SectionType,
  composerEvents,
  formInviteFriendEmailContent
} from './../utils/const';
import { openFilledComposerWindow } from './../utils/ipc';

const mapStateToProps = state => {
  return {
    items: getSystemLabels(state),
    labels: getVisibleLabels(state)
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
          }
        }
      });
    },
    onClickSettings: () => {
      const type = SectionType.SETTINGS;
      ownProps.onClickSection(type);
    }
  };
};

const SideBar = connect(mapStateToProps, mapDispatchToProps)(SideBarView);

export default SideBar;
