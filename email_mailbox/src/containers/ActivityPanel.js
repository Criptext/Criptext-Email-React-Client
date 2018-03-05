import { connect } from 'react-redux';
import * as actions from '../actions/index';
import ActivityPanelView from '../components/ActivityPanel';
import * as TimeUtils from '../utils/TimeUtils';

const orderFeedsByDate = feeds => {
  return feeds.sortBy(feed => feed.get('time'));
};

const setFeedTime = (feed, field) => {
  return feed.set(field, TimeUtils.defineTimeByToday(feed.get(field)));
};

const isNew = date => {
  if (date.indexOf(':') > -1) {
    return true;
  }
  if ( date === 'Today' ) {
    return true;
  }
  return false;
}

const clasifyFeeds = feeds => {
  const newsFiltered = feeds.filter(item => isNew(item.get('date'))===true );
  const oldsFiltered = feeds.filter(item => isNew(item.get('date'))===false);
  return { newsFiltered, oldsFiltered };
};

const populateFeeds = (state, feeds) => {
  const emails = state.get('emails');
  const users = state.get('users');
  return feeds.map(feed => {
    const emailFeed = emails.get(feed.get('emailId'));
    const userFeed = users[feed.get('username')];
    if (emailFeed !== undefined) {
      feed = feed.set('emailFeed', emailFeed);
      feed = feed.set('isMuted', emailFeed.get('isMuted'));
    }
    if ( userFeed !== undefined ){
      feed = feed.set('name', userFeed.name);
    }
    return feed;
  });
};

const mapStateToProps = state => {
  const orderedFeeds = orderFeedsByDate(state.get('feeds'));
  const populated = populateFeeds(state, orderedFeeds);
  const feeds = populated.map(feed => {
    return setFeedTime(feed, 'date');
  });
  const { newsFiltered, oldsFiltered } = clasifyFeeds(feeds);
  return {
    newFeeds: newsFiltered,
    oldFeeds: oldsFiltered
  };
};

const mapDispatchToProps = dispatch => {
  return {
    onLoadFeeds: () => {
      dispatch(actions.loadFeeds());
    }
  };
};

const ActivityPanel = connect(mapStateToProps, mapDispatchToProps)(
  ActivityPanelView
);

export default ActivityPanel;
