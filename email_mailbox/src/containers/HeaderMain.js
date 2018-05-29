import { connect } from 'react-redux';
import * as actions from '../actions/index';
import HeaderMainWrapper from '../components/HeaderMainWrapper';
import { SectionType } from '../utils/const';

const mapStateToProps = state => {
  const suggestions = state.get('suggestions');
  const allLabels = state
    .get('labels')
    .toArray()
    .map(label => label.toJS());
  return {
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
      dispatch(actions.loadSuggestions(filter));
    },
    onSearchSelectThread: threadId => {
      const type = SectionType.THREAD;
      const params = {
        mailboxSelected: 'search',
        threadIdSelected: threadId
      };
      dispatch(actions.selectThread(threadId));
      ownProps.onClickSection(type, params);
    },
    onSearchThreads: searchParams => {
      const type = SectionType.MAILBOX;
      const params = {
        mailboxSelected: 'search',
        searchParams
      };
      ownProps.onClickSection(type, params);
    }
  };
};

const HeaderMain = connect(mapStateToProps, mapDispatchToProps)(
  HeaderMainWrapper
);

export default HeaderMain;
