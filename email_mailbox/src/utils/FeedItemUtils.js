import { FeedItemType } from './const';
import {
  getAllFeedItems,
  getEmailsByArrayParam,
  getFeedItemsCounterBySeen
} from './ipc';
import { defineTimeByToday } from './TimeUtils';
import string from './../lang';

export const defineFeedItems = async () => {
  const allFeeds = await getAllFeedItems();
  const badge = await getFeedItemsCounterBySeen(0);
  const feeds = await Promise.all(
    allFeeds.map(async feed => {
      const [emailData] = await getEmailsByArrayParam({ ids: [feed.emailId] });
      const action = defineFeedAction(feed.type);
      const date = defineTimeByToday(feed.date);
      return { ...feed, action, date, emailData };
    })
  );
  const feedItems = feeds.reduce(
    (result, feedItem) => ({
      ...result,
      [feedItem.id]: feedItem
    }),
    {}
  );

  return { feedItems, badge: badge[0].count };
};

const defineFeedAction = type => {
  switch (type) {
    case FeedItemType.DOWNLOADED.value:
      return string.activity.downloaded;
    default:
      return string.activity.opened;
  }
};
