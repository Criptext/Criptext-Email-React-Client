import { getAllFeedItems, getEmailsByIds } from './ipc';
import { getSeenTimestamp } from './storage';

export const assembleFeedItems = async () => {
  const allFeeds = await getAllFeedItems();
  const feeds = await Promise.all(
    allFeeds.map(async feed => {
      const [emailData] = await getEmailsByIds([feed.emailId]);
      const lastTimestamp = new Date(getSeenTimestamp());
      const feedDate = new Date(feed.date);
      const isNew = feedDate.getTime() > lastTimestamp.getTime();
      return { ...feed, emailData, isNew };
    })
  );
  return feeds.reduce((result, feedItem) => {
    result[feedItem.id] = feedItem;
    return result;
  }, {});
};
