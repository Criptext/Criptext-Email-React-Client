import { getAllFeedItems, getEmailsByIds } from './ipc';

export const defineFeedItems = async () => {
  const allFeeds = await getAllFeedItems();
  const feeds = await Promise.all(
    allFeeds.map(async feed => {
      const [emailData] = await getEmailsByIds([feed.emailId]);
      return { ...feed, emailData };
    })
  );
  return feeds.reduce(
    (result, feedItem) => ({
      ...result,
      [feedItem.id]: feedItem
    }),
    {}
  );
};
