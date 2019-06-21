import { connect } from 'react-redux';
import { loadFeedItems } from './../actions/index';
import ActivityPanelView from './../components/ActivityPanel';
import * as TimeUtils from './../utils/TimeUtils';
import { FeedItemType } from './../utils/const';
import string from '../lang';

const orderFeedsByDate = feeds => {
  return feeds.sortBy(feed => feed.get('date')).reverse();
};

const setFeedTime = (feed, field) => {
  return feed.set(field, TimeUtils.defineTimeByToday(feed.get(field)));
};

const clasifyFeeds = feeds => {
  const newFeeds = feeds.filter(feed => !feed.get('seen'));
  const oldFeeds = feeds.filter(feed => feed.get('seen'));
  return { newFeeds, oldFeeds };
};

const defineFeedAction = feed => {
  switch (feed.get('type')) {
    case FeedItemType.DOWNLOADED.value:
      return feed.set('action', string.activity.downloaded);
    default:
      return feed.set('action', string.activity.opened);
  }
};

const setFeedTitle = (state, feed) => {
  const feedContact = state.get('contacts').get(`${feed.get('contactId')}`);
  if (!feedContact)
    return feed.set(
      'title',
      `${string.activity.someone} ${feed.get('action')}`
    );

  const contactData = feedContact.toJS();
  const { name, email } = contactData;
  const title = `${name || email} ${feed.get('action')}`;
  return feed.set('title', title);
};

const populateFeeds = (state, feeds) => {
  return feeds
    .map(feed => {
      const emailData = feed.get('emailData');
      if (emailData) {
        feed = feed.set('isMuted', emailData.get('isMuted'));
        feed = setFeedTime(feed, 'date');
        feed = defineFeedAction(feed);
        return setFeedTitle(state, feed);
      }
      return null;
    })
    .filter(item => item !== null);
};

const mapStateToProps = state => {
  const feeds = state.get('feeditems').toList();
  const orderedFeeds = orderFeedsByDate(feeds);
  const populated = populateFeeds(state, orderedFeeds);
  const { newFeeds, oldFeeds } = clasifyFeeds(populated);
  const newFeedsPlain = newFeeds.toJS();
  const feedItemIds = newFeedsPlain.map(feedItem => feedItem.id);
  return {
    newFeeds: newFeedsPlain,
    oldFeeds: oldFeeds.toJS(),
    feedItemIds
  };
};

const mapDispatchToProps = dispatch => {
  return {
    onLoadFeeds: () => {
      dispatch(loadFeedItems());
    }
  };
};

const ActivityPanel = connect(
  mapStateToProps,
  mapDispatchToProps
)(ActivityPanelView);

export default ActivityPanel;
