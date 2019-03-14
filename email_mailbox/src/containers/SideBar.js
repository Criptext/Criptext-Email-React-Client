import ReactPerformance from 'react-performance';
import { connect } from 'react-redux';
import SideBarView from '../components/SideBarWrapper';
import { getSystemLabels, getVisibleLabels } from '../selectors/labels';
import {
  SectionType,
  composerEvents,
  formInviteFriendEmailContent
} from './../utils/const';
import { formContactSupportEmailContent } from '../utils/EmailUtils';
import { openFilledComposerWindow } from './../utils/ipc';

const mapStateToProps = state => {
  return {
    items: getSystemLabels(state),
    labels: getVisibleLabels(state)
  };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    onClickComposeContactSupportEmail: async () => {
      const data = await formContactSupportEmailContent();
      openFilledComposerWindow({
        type: composerEvents.NEW_WITH_DATA,
        data
      });
    },
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

// const SideBar = connect(
//   mapStateToProps,
//   mapDispatchToProps
// )(SideBarView);

const SideBar = ReactPerformance.connect({
  mapStateToProps,
  mapDispatchToProps,
  getId: 'SideBarContainer',
  Component: SideBarView
});

export default SideBar;
