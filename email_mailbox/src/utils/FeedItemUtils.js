import {
  getAllFeedItems,
  getEmailsByIds,
  getFeedItemsCounterBySeen
} from './ipc';

export const defineFeedItems = async () => {
  const allFeeds = await getAllFeedItems();
  const badge = await getFeedItemsCounterBySeen(0);
  const feeds = await Promise.all(
    allFeeds.map(async feed => {
      const [emailData] = await getEmailsByIds([feed.emailId]);
      return { ...feed, emailData };
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
