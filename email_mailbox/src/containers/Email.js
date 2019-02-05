import { connect } from 'react-redux';
import EmailView from './../components/EmailWrapper';
import { defineTimeByToday, defineLargeTime } from './../utils/TimeUtils';
import { getTwoCapitalLetters } from './../utils/StringUtils';
import { matchOwnEmail } from './../utils/ContactUtils';
import { addCollapseDiv, parseContactRow } from './../utils/EmailUtils';
import randomcolor from 'randomcolor';
import { LabelType, myAccount, mySettings } from './../utils/electronInterface';
import {
  openFilledComposerWindow,
  sendPrintEmailEvent,
  sendOpenEmailSource,
  downloadFileInFileSystem
} from './../utils/ipc';
import {
  loadFiles,
  muteEmail,
  unsendEmail,
  updateEmailLabels,
  removeEmails
} from './../actions/index';
import {
  EmailStatus,
  unsentText,
  composerEvents,
  appDomain,
  avatarBaseUrl
} from '../utils/const';
import {
  setFileSuccessHandler,
  setCryptoInterfaces,
  setDownloadHandler
} from '../utils/FileManager';

const defineFrom = (email, contacts) => {
  const emailFrom = parseContactRow(email.fromAddress || '');
  return emailFrom.name
    ? [emailFrom]
    : getContacts(contacts, email.fromContactIds);
};

const mapStateToProps = (state, ownProps) => {
  const email = ownProps.email;
  const contacts = state.get('contacts');
  const avatarTimestamp = state.get('activities').get('avatarTimestamp');
  const from = defineFrom(email, contacts);
  const to = getContacts(contacts, email.to);
  const cc = getContacts(contacts, email.cc);
  const bcc = getContacts(contacts, email.bcc);
  const senderName = from.length ? from[0].name : '';
  const senderEmail = from.length ? from[0].email : '';
  const color = senderEmail
    ? randomcolor({
        seed: senderName || senderEmail,
        luminosity: mySettings.theme === 'dark' ? 'dark' : 'bright'
      })
    : 'transparent';
  const letters = getTwoCapitalLetters(senderName || senderEmail || '');
  const recipient = senderEmail.replace(`@${appDomain}`, '');
  const avatarUrl = senderEmail.includes(`@${appDomain}`)
    ? `${avatarBaseUrl}${recipient}?date=${avatarTimestamp}`
    : null;
  const date = email.date;
  const { files, inlineImages } = getFiles(
    state.get('files'),
    email.fileTokens
  );
  const preview =
    email.status === EmailStatus.UNSEND ? unsentText : email.preview;
  const content =
    email.status === EmailStatus.UNSEND
      ? `Unsent: At ${defineTimeByToday(email.unsendDate)}`
      : addCollapseDiv(email.content, email.key);
  const myEmail = {
    ...email,
    date: defineTimeByToday(date),
    dateLong: defineLargeTime(date),
    subject: email.subject || '(No Subject)',
    from,
    to,
    cc,
    bcc,
    color,
    letters,
    preview,
    content
  };
  const isUnsend = email.status === EmailStatus.UNSEND;
  const isSpam = email.labelIds.includes(LabelType.spam.id);
  const isTrash = email.labelIds.includes(LabelType.trash.id);
  const isDraft =
    email.labelIds.findIndex(labelId => {
      return labelId === LabelType.draft.id;
    }) === -1
      ? false
      : true;
  return {
    avatarUrl,
    email: myEmail,
    files,
    isSpam,
    isTrash,
    isDraft,
    isFromMe: matchOwnEmail(myAccount.recipientId, senderEmail),
    isUnsend,
    inlineImages,
    letters
  };
};

const getContacts = (contacts, contactIds) => {
  return contactIds
    ? contactIds.map(contactId => {
        const contact = contacts.get(String(contactId));
        return contacts.size && contact
          ? contact.toObject()
          : { id: contactId };
      })
    : [];
};

const getFiles = (fileStore, fileTokens) => {
  if (!fileTokens) return { files: [], inlineImages: [] };
  if (!fileStore.size) return { files: [], inlineImages: [] };
  return fileTokens.reduce(
    (result, token) => {
      const inlineImages = [...result.inlineImages];
      const files = [...result.files];
      if (fileStore.get(token)) {
        const file = fileStore.get(token);
        if (file.get('cid')) {
          inlineImages.push(file.toJS());
        } else {
          files.push(file.toJS());
        }
      }
      return { files, inlineImages };
    },
    { files: [], inlineImages: [] }
  );
};

const mapDispatchToProps = (dispatch, ownProps) => {
  const email = ownProps.email;
  const isLast = ownProps.staticOpen;
  return {
    onEditDraft: () => {
      const key = email.key;
      openFilledComposerWindow({
        key,
        type: composerEvents.EDIT_DRAFT
      });
    },
    toggleMute: ev => {
      ev.stopPropagation();
      const emailId = String(email.id);
      const valueToSet = email.isMuted === 1 ? false : true;
      dispatch(muteEmail(emailId, valueToSet));
    },
    onLoadFiles: tokens => {
      dispatch(loadFiles(tokens));
    },
    onReplyEmail: ev => {
      ev.stopPropagation();
      const keyEmailToRespond = email.key;
      openFilledComposerWindow({
        keyEmailToRespond,
        type: composerEvents.REPLY
      });
    },
    onReplyLast: () => {
      if (isLast) {
        const keyEmailToRespond = email.key;
        openFilledComposerWindow({
          keyEmailToRespond,
          type: composerEvents.REPLY
        });
      }
    },
    onReplyAll: ev => {
      ev.stopPropagation();
      const keyEmailToRespond = email.key;
      openFilledComposerWindow({
        keyEmailToRespond,
        type: composerEvents.REPLY_ALL
      });
    },
    onForward: ev => {
      ev.stopPropagation();
      const keyEmailToRespond = email.key;
      openFilledComposerWindow({
        keyEmailToRespond,
        type: composerEvents.FORWARD
      });
    },
    onMarkAsSpam: ev => {
      ev.stopPropagation();
      const labelsAdded = [LabelType.spam.text];
      const labelsRemoved = [];
      dispatch(
        updateEmailLabels({
          email,
          labelsAdded,
          labelsRemoved
        })
      ).then(() => {
        if (ownProps.count === 1) {
          ownProps.onBackOption();
        }
      });
    },
    onDelete: ev => {
      ev.stopPropagation();
      const labelsAdded = [LabelType.trash.text];
      const labelsRemoved = [];
      dispatch(
        updateEmailLabels({
          email,
          labelsAdded,
          labelsRemoved
        })
      ).then(() => {
        if (ownProps.count === 1) {
          ownProps.onBackOption();
        }
      });
    },
    onDeletePermanently: () => {
      const emailsToDelete = [email];
      dispatch(removeEmails(emailsToDelete)).then(() => {
        if (ownProps.count === 1) {
          ownProps.onBackOption();
        }
      });
    },
    onUnsendEmail: () => {
      const contactIds = [...email.to, ...email.cc, ...email.bcc];
      const unsendDate = new Date();
      const params = {
        key: email.key,
        emailId: email.id,
        contactIds,
        unsendDate
      };
      dispatch(unsendEmail(params));
    },
    onOpenEmailSource: ev => {
      ev.stopPropagation();
      sendOpenEmailSource(email.key);
    },
    onPrintEmail: ev => {
      ev.stopPropagation();
      sendPrintEmailEvent(email.id);
    },
    onDownloadInlineImages: (inlineImages, callback) => {
      const cidFilepathPairs = {};
      const handleSuccessDownloadInlineImage = async ({ token, url }) => {
        const [inlineImage] = inlineImages.filter(img => img.token === token);
        if (inlineImage) {
          const { cid, name } = inlineImage;
          const downloadParams = {
            downloadType: 'inline',
            filename: `${cid}-${name}`,
            metadataKey: email.key,
            url
          };
          const filePath = await downloadFileInFileSystem(downloadParams);
          cidFilepathPairs[inlineImage.cid] = filePath;
          if (Object.keys(cidFilepathPairs).length === inlineImages.length)
            callback(cidFilepathPairs);
        }
      };

      setFileSuccessHandler(handleSuccessDownloadInlineImage);
      for (const inlineImg of inlineImages) {
        const { key, iv } = inlineImg;
        setCryptoInterfaces(key, iv);
        setDownloadHandler(inlineImg.token);
      }
    },
    onInjectFilepathsOnEmailContentByCid: (emailContent, cidFilepathPairs) => {
      const newEmailContent = Object.keys(cidFilepathPairs).reduce(
        (emailContentInjected, cid) => {
          const imgPath = cidFilepathPairs[cid];
          return emailContentInjected.replace(
            `src="cid:${cid}"`,
            `src="${imgPath}"`
          );
        },
        emailContent
      );
      return newEmailContent;
    }
  };
};

const Email = connect(
  mapStateToProps,
  mapDispatchToProps
)(EmailView);

export default Email;
