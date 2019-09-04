#include "FullEmail.h"
#include "EmailLabel.h"
#include "EmailContact.h"

using namespace std;

// vector<CriptextDB::FullEmail> getFullEmailsByIds(string dbPath, vector<int> emailIds, int accountId){
//   vector<Email> emails = CriptextDB::getEmailsByIds(dbPath, emailIds, accountId);
//   vector<FullEmail> fullEmails;
//   for(const CriptextDB::Email &email : emails){
//     vector<CRFile> files = CriptextDB::getFilesByEmailId(dbPath, email.id);
//     vector<CriptextDB::EmailLabel> emailLabels = CriptextDB::getEmailLabelsByEmailId(dbPath, email.id);
//     vector<int> labelIds;
//     for(const CriptextDB::EmailLabel &emailLabel : emailLabels){
//         labelIds.push_back(emailLabel.labelId);
//     }
//     vector<Label> labels = CriptextDB::getLabelsByIds(dbPath, labelIds, accountId);
//     vector<Contact> to = CriptextDB::getContactsByEmailIdAndType(dbPath, email.id, "to");
//     vector<Contact> cc = CriptextDB::getContactsByEmailIdAndType(dbPath, email.id, "cc");
//     vector<Contact> bcc = CriptextDB::getContactsByEmailIdAndType(dbPath, email.id, "bcc");
//     string fromEmail;
//     size_t leftBracket = email.fromAddress.find_last_of("<");
//     size_t rightBracket = email.fromAddress.find_last_of(">");
//     if(rightBracket == string::npos || leftBracket == string::npos)
//         fromEmail = email.fromAddress;
//     else
//         fromEmail = email.fromAddress.substr(leftBracket + 1, rightBracket);
//     Contact from = CriptextDB::getContactByEmail(dbPath, fromEmail);
//     FullEmail fullEmail = { email, labels, to, cc, bcc, from, files, email.preview };

//     fullEmails.push_back(fullEmail);
//   }
//   return fullEmails;
// }

// vector<CriptextDB::FullEmail> CriptextDB::getFullEmailsByThreadIds(string dbPath, vector<string> threadIds, int accountId){
//   vector<Email> emails = CriptextDB::getEmailsByThreadIds(dbPath, threadIds, accountId);
//   vector<FullEmail> fullEmails;
//   for(const CriptextDB::Email &email : emails){
//     vector<CRFile> files = CriptextDB::getFilesByEmailId(dbPath, email.id);
//     vector<CriptextDB::EmailLabel> emailLabels = CriptextDB::getEmailLabelsByEmailId(dbPath, email.id);
//     vector<int> labelIds;
//     for(const CriptextDB::EmailLabel &emailLabel : emailLabels){
//         labelIds.push_back(emailLabel.labelId);
//     }
//     vector<Label> labels = CriptextDB::getLabelsByIds(dbPath, labelIds, accountId);
//     vector<Contact> to = CriptextDB::getContactsByEmailIdAndType(dbPath, email.id, "to");
//     vector<Contact> cc = CriptextDB::getContactsByEmailIdAndType(dbPath, email.id, "cc");
//     vector<Contact> bcc = CriptextDB::getContactsByEmailIdAndType(dbPath, email.id, "bcc");
//     string fromEmail;
//     size_t leftBracket = email.fromAddress.find_last_of("<");
//     size_t rightBracket = email.fromAddress.find_last_of(">");
//     if(rightBracket == string::npos || leftBracket == string::npos)
//         fromEmail = email.fromAddress;
//     else
//         fromEmail = email.fromAddress.substr(leftBracket + 1, rightBracket);
//     Contact from = CriptextDB::getContactByEmail(dbPath, fromEmail);
//     FullEmail fullEmail = { email, labels, to, cc, bcc, from, files, email.preview };

//     fullEmails.push_back(fullEmail);
//   }
//   return fullEmails;
// }

