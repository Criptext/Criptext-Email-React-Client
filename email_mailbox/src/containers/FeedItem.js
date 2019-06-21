import { connect } from 'react-redux';
import { removeFeedItem, updateFeedItem } from '../actions/index';
import FeedItemWrapperView from '../components/FeedItemWrapper';
import { loadContacts } from '../actions/contacts';

const mapStateToProps = (state, ownProps) => {
  const { id, title, emailData, seen, date } = ownProps.feed;
  const { subject, threadId } = emailData;
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

const FeedItem = connect(
  mapStateToProps,
  mapDispatchToProps
)(FeedItemWrapperView);

export default FeedItem;
