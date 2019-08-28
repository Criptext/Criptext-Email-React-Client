#include "Thread.h"
#include "FullEmail.h"
#include "EmailLabel.h"
#include "EmailContact.h"
#include <unordered_set>

using namespace std;

string CriptextDB::getThreadsByThreadIds(string dbPath, vector<string> threadIds, int labelId, string date, int limit, int accountId){
  vector<Thread> threads;
  for(const string &threadId: threadIds){
    vector<Email> emails = CriptextDB::getEmailsByThreadIds(dbPath, threadIds, labelId, date, limit, accountId);
    vector<CriptextDB::FullEmail> fullEmails;
    for(const CriptextDB::Email &email : emails){
      vector<CRFile> files = CriptextDB::getFilesByEmailId(dbPath, email.id);
      vector<CriptextDB::EmailLabel> emailLabels = CriptextDB::getEmailLabelsByEmailId(dbPath, email.id);
      vector<int> labelIds;
      for(const CriptextDB::EmailLabel &emailLabel : emailLabels){
          labelIds.push_back(emailLabel.labelId);
      }
      vector<Label> labels = CriptextDB::getLabelsByIds(dbPath, labelIds, accountId);
      vector<Contact> to = CriptextDB::getContactsByEmailIdAndType(dbPath, email.id, "to");
      vector<Contact> cc = CriptextDB::getContactsByEmailIdAndType(dbPath, email.id, "cc");
      vector<Contact> bcc = CriptextDB::getContactsByEmailIdAndType(dbPath, email.id, "bcc");
      string fromEmail = CriptextDB::DBUtils::getFromEmail(email.fromAddress);
      Contact from = CriptextDB::getContactByEmail(dbPath, fromEmail);
      FullEmail fullEmail = { email, labels, to, cc, bcc, from, files, email.preview };

      fullEmails.push_back(fullEmail);
    }
    std::unordered_set<int> labelIds;
    vector<int> emailIds;
    vector<string> fileTokens;
    unordered_set<string> fromNames;
    std::transform(fullEmails.cbegin(), fullEmails.cend(), std::back_inserter(emailIds), [&](FullEmail const & fullEmail) {
        std::transform(fullEmail.labels.cbegin(), fullEmail.labels.cend(), std::back_inserter(labelIds), [&](Label const & label) {
          return label.id;
        });
        std::transform(fullEmail.files.cbegin(), fullEmail.files.cend(), std::back_inserter(fileTokens), [&](CRFile const & file) {
          return file.token;
        });
        fromNames.insert(fullEmail.email.fromAddress);
        return fullEmail.email.id;
    });
    Thread thread = { labelIds, fullEmails.back().email.boundary, fullEmails.back().email.content, fullEmails.back().email.date, emailIds,
     fileTokens, fullEmails.back().from.email, CriptextDB::DBUtils::joinSet(fromNames), fullEmails.back().email.id };
  }
  return "fullEmails";
}

