#ifndef FEED_ITEM_H_
#define FEED_ITEM_H_

#include <SQLiteCpp/SQLiteCpp.h>
#include <string>
#include <memory>
#include <vector>

using namespace std;

namespace CriptextDB {
  struct FeedItem {
    int id;
    string date;
    int type;
    bool seen;
    int emailId;
    int contactId;
    int fileId;
  };

  int createFeedItem(string dbPath, string date, int type, bool seen, int emailId, int contactId, int fileId);
  int deleteFeedItemById(string dbPath, int feedId);
  vector<FeedItem> getAllFeedItems(string dbPath);
  int getFeedItemsCounterBySeen(string dbPath);
  int updateFeedItems(string dbPath, vector<int> feedIds);
} 

#endif