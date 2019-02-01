import { connect } from 'react-redux';
import * as actions from '../actions/index';
import HeaderMainWrapper from '../components/HeaderMainWrapper';
import { toLowerCaseWithoutSpaces } from './../utils/StringUtils';
import { SectionType, avatarBaseUrl } from '../utils/const';
import { myAccount } from '../utils/electronInterface';
import string from './../lang';

const defineLabels = labels => {
  return labels.toArray().map(label => {
    const text = label.get('text');
    return {
      id: label.get('id'),
      text:
        label.get('type') === 'system'
          ? string.labelsItems[toLowerCaseWithoutSpaces(text)]
          : text
    };
  });
};

const mapStateToProps = state => {
  const suggestions = state.get('suggestions');
  const allLabels = defineLabels(state.get('labels'));
  const avatarTimestamp = state.get('activities').get('avatarTimestamp');
  const avatarUrl = `${avatarBaseUrl}${
    myAccount.recipientId
  }?date=${avatarTimestamp}`;
  return {
    avatarUrl,
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
    onSearchSelectThread: (threadId, searchParams) => {
      const type = SectionType.THREAD;
      const params = {
        mailboxSelected: 'search',
        threadIdSelected: threadId,
        searchParams
      };
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

const HeaderMain = connect(
  mapStateToProps,
  mapDispatchToProps
)(HeaderMainWrapper);

export default HeaderMain;
