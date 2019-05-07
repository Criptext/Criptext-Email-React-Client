import { connect } from 'react-redux';
import { getAllLabels } from '../selectors/labels';
import { loadSuggestions } from '../actions/index';
import HeaderMainWrapper from '../components/HeaderMainWrapper';
import { SectionType } from '../utils/const';
import { openLoginWindow } from '../utils/ipc';
import { selectAccountAsActive } from '../utils/electronEventInterface';

const mapStateToProps = state => {
  const suggestions = state.get('suggestions');
  const allLabels = getAllLabels(state);
  const avatarTimestamp = state.get('activities').get('avatarTimestamp');
  return {
    avatarTimestamp,
    allLabels,
    hints: suggestions.get('hints'),
    threads: suggestions.get('threads')
  };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    onClickSection: () => {
      const type = SectionType.SETTINGS;
      ownProps.onClickSection(type);
    },
    onSearchChange: filter => {
      dispatch(loadSuggestions(filter));
    },
    onSearchSelectThread: (threadId, searchParams) => {
      const type = SectionType.THREAD;
      const mailboxSelected = {
        id: -2,
        text: 'Search'
      };
      const params = {
        mailboxSelected,
        threadIdSelected: threadId,
        searchParams
      };
      ownProps.onClickSection(type, params);
    },
    onSearchThreads: searchParams => {
      const type = SectionType.MAILBOX;
      const mailboxSelected = {
        id: -2,
        text: 'Search'
      };
      const params = {
        mailboxSelected,
        searchParams
      };
      ownProps.onClickSection(type, params);
    },
    openLogin: params => {
      openLoginWindow(params);
    },
    onSelectAccount: async ({ id, recipientId }) => {
      await selectAccountAsActive({ id, recipientId });
    }
  };
};

const HeaderMain = connect(
  mapStateToProps,
  mapDispatchToProps
)(HeaderMainWrapper);

export default HeaderMain;
