import { connect } from 'react-redux';
import { removeFeedItem, updateFeedItem } from '../actions/index';
import FeedItemWrapperView from '../components/FeedItemWrapper';
import { loadContacts } from '../actions/contacts';
import { myAccount } from './../utils/electronInterface';
import { appDomain } from './../utils/const';
import string from './../lang';

const mapStateToProps = (state, ownProps) => {
  const { id, action, contactId, emailData, seen, date } = ownProps.feed;
  const { subject, threadId } = emailData;
  const contact = state.get('contacts').get(`${contactId}`);
  const name = contact ? contact.get('name') : '';
  const email = contact ? contact.get('email') : '';
  const myEmailAddress = myAccount.recipientId.includes('@')
    ? myAccount.recipientId
    : `${myAccount.recipientId}@${appDomain}`;
  const contactName = email === myEmailAddress ? string.activity.someone : name;
  const title = contact ? `${contactName} ${action}` : '';
  const subtitle = subject;
  return {
    id,
    title,
    subtitle,
    threadId,
    seen,
    date
  };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  const feed = ownProps.feed;
  return {
    onLoadContactData: () => {
      dispatch(loadContacts([feed.contactId]));
    },
    onSelectFeed: (id, seen) => {
      if (seen) {
        dispatch(updateFeedItem({ id, seen }));
      }
    },
    onRemoveFeed: () => {
      dispatch(removeFeedItem(feed.id));
    }
  };
};

const FeedItem = connect(mapStateToProps, mapDispatchToProps)(
  FeedItemWrapperView
);

export default FeedItem;
