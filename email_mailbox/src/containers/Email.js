/* eslint-env node, process */
import { connect } from 'react-redux';
import { makeGetFiles } from './../selectors/files';
import EmailView from './../components/EmailWrapper';
import {
  defineTimeByToday,
  defineLargeTime,
  defineUnsentText
} from './../utils/TimeUtils';
import { getContactByIds } from './../utils/ipc';
import { SocketCommand } from './../utils/const';
import Messages from './../data/message';
import { MessageType } from './../components/Message';
import { getTwoCapitalLetters, hasAnySubstring } from './../utils/StringUtils';
import { matchOwnEmail } from './../utils/ContactUtils';
import { addCollapseDiv } from './../utils/EmailUtils';
import randomcolor from 'randomcolor';
import { LabelType, myAccount, mySettings } from './../utils/electronInterface';
import { Event, sendMailboxEvent } from './../utils/electronEventInterface';
import {
  openFilledComposerWindow,
  sendPrintEmailEvent,
  sendOpenEmailSource,
  downloadFileInFileSystem,
  checkFileDownloaded,
  reportPhishing,
  changeEmailBlockedAccount,
  changeEmailBlockedContact,
  postPeerEvent
} from './../utils/ipc';
import {
  modifyContactIsTrusted,
  removeEmails,
  unsendEmail,
  updateEmailLabels,
  updateEmailOnSuccess,
  updateUnreadEmail
} from './../actions/index';
import {
  EmailStatus,
  composerEvents,
  appDomain,
  avatarBaseUrl,
  avatarBorderUrl
} from '../utils/const';
import {
  setFileSuccessHandler,
  setCryptoInterfaces,
  setDownloadHandler
} from '../utils/FileManager';
import string from './../lang';

const definePreviewAndContent = (email, isCollapse, inlineImages) => {
  if (email.status === EmailStatus.UNSEND) {
    const unsentText = defineUnsentText(email.unsentDate);
    return {
      preview: unsentText,
      content: unsentText
    };
  }
  const emptyEmailText = string.mailbox.empty_body;
  const hasInlineImages = inlineImages.length > 0;
  return {
    preview: email.preview || emptyEmailText,
    content: !email.preview
      ? hasInlineImages
        ? email.content
        : emptyEmailText
      : addCollapseDiv(email.content || emptyEmailText, email.key, isCollapse)
  };
};

const handlePeerEventIsTrustedReply = async (
  contacts,
  contactIds,
  dispatch
) => {
  const contactsWithoutIsTrusted = contacts.filter(
    contact => contact.isTrusted === undefined
  );
  const contactsFromDb = contactsWithoutIsTrusted.length
    ? await getContactByIds(contactIds)
    : [];

  const contactsToSend = [...contacts, ...contactsFromDb].filter(
    contact => !contact.isTrusted
  );
  if (contactsToSend.length) {
    await changeEmailBlockedContact({
      contactId: contactsToSend.map(contact => contact.id),
      isTrusted: true
    });
    await Promise.all(
      contactsToSend.map(async contact => {
        const contactEmail = contact.email;
        const eventParams = {
          cmd: SocketCommand.PEER_SET_TRUSTED_EMAIL,
          params: {
            email: contactEmail,
            trusted: true
          }
        };
        await postPeerEvent({ data: eventParams });
      })
    );

    dispatch(
      modifyContactIsTrusted(contactsToSend.map(contact => contact.id), true)
    );
  }
};

const makeMapStateToProps = () => {
  const getFiles = makeGetFiles();

  const mapStateToProps = (state, ownProps) => {
    const email = ownProps.email;
    const avatarTimestamp = state.get('activities').get('avatarTimestamp');
    const senderName = email.from.length ? email.from[0].name : '';
    const senderEmail = email.from.length ? email.from[0].email : '';
    const color = senderEmail
      ? randomcolor({
          seed: senderName || senderEmail,
          luminosity: mySettings.theme === 'dark' ? 'dark' : 'bright'
        })
      : 'transparent';
    const letters = getTwoCapitalLetters(senderName || senderEmail || '');
    const [username, domain = appDomain] = senderEmail.split(`@`);
    const avatarUrl = `${avatarBaseUrl}${domain}/${username}?date=${avatarTimestamp}`;
    const borderUrl = `${avatarBorderUrl}${domain}/${username}?date=${avatarTimestamp}`;
    const date = email.date;
    const { files, inlineImages } = getFiles(state, email);
    const isCollapse = !!hasAnySubstring(['Re:', 'RE:'], email.subject);
    const { preview, content } = definePreviewAndContent(
      email,
      isCollapse,
      inlineImages
    );
    const isFromMe = matchOwnEmail(myAccount.recipientId, senderEmail);
    const isEmpty = !(email.preview && email.preview.length);
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
      borderUrl,
      color,
      blockRemoteContent: myAccount.activeAccount.blockRemoteContent,
      content,
      date: defineTimeByToday(date),
      dateLong: defineLargeTime(date),
      email,
      files,
      isSpam,
      isTrash,
      isDraft,
      isEmpty,
      isFromMe,
      isUnsend,
      inlineImages,
      letters,
      preview
    };
  };
  return mapStateToProps;
};

const defineInjectedSrc = imgPath => {
  return `src="${
    process.env.NODE_ENV === 'development' ? 'file://' : ''
  }${imgPath}"`;
};

const mapDispatchToProps = (dispatch, ownProps) => {
  const email = ownProps.email;
  const isLast = ownProps.staticOpen;
  const isTrash = email.labelIds.includes(LabelType.trash.id);

  const onMarkAsSpam = () => {
    const labelsAdded = [LabelType.spam.text];
    const labelsRemoved = isTrash ? [LabelType.trash.text] : [];
    const labelId = ownProps.mailboxSelected.id;
    dispatch(
      updateEmailLabels({
        labelId,
        email,
        labelsAdded,
        labelsRemoved
      })
    ).then(() => {
      if (ownProps.count === 1) {
        ownProps.onBackOption();
      }
    });
  };

  return {
    onEditDraft: () => {
      const key = email.key;
      openFilledComposerWindow({
        key,
        type: composerEvents.EDIT_DRAFT
      });
    },
    onDelete: ev => {
      ev.stopPropagation();
      const labelsAdded = [LabelType.trash.text];
      const labelsRemoved = [];
      const labelId = ownProps.mailboxSelected.id;
      dispatch(
        updateEmailLabels({
          labelId,
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
      const labelId = ownProps.mailboxSelected.id;
      dispatch(removeEmails(labelId, emailsToDelete)).then(() => {
        if (ownProps.count === 1) {
          ownProps.onBackOption();
        }
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
    onMarkAsSpam: async ev => {
      ev.stopPropagation();
      const params = {
        emails: [email.from[0].email],
        type: 'spam'
      };
      reportPhishing(params);

      await changeEmailBlockedContact({
        contactId: email.fromContactIds,
        isTrusted: false
      });
      const emailText = email.from[0].email;
      const eventParams = {
        cmd: SocketCommand.PEER_SET_TRUSTED_EMAIL,
        params: {
          email: emailText,
          trusted: false
        }
      };
      await postPeerEvent({ data: eventParams });

      onMarkAsSpam();
    },
    onMarkUnread: ev => {
      ev.stopPropagation();
      const labelId = ownProps.mailboxSelected.id;
      dispatch(
        updateUnreadEmail(labelId, email.threadId, email.id, email.key, true)
      ).then(() => ownProps.onBackOption());
    },
    onOpenEmailSource: ev => {
      ev.stopPropagation();
      sendOpenEmailSource({ key: email.key, accountId: myAccount.id });
    },
    onPrintEmail: ev => {
      ev.stopPropagation();
      sendPrintEmailEvent(email.id);
    },
    onReplyEmail: async ev => {
      ev.stopPropagation();
      const keyEmailToRespond = email.key;
      await handlePeerEventIsTrustedReply(
        email.from,
        email.fromContactIds,
        dispatch
      );
      openFilledComposerWindow({
        keyEmailToRespond,
        type: composerEvents.REPLY
      });
    },
    onReplyLast: async () => {
      if (isLast) {
        const keyEmailToRespond = email.key;
        await handlePeerEventIsTrustedReply(
          email.from,
          email.fromContactIds,
          dispatch
        );
        openFilledComposerWindow({
          keyEmailToRespond,
          type: composerEvents.REPLY
        });
      }
    },
    onReplyAll: async ev => {
      ev.stopPropagation();
      const keyEmailToRespond = email.key;
      await handlePeerEventIsTrustedReply(
        email.from,
        email.fromContactIds,
        dispatch
      );
      openFilledComposerWindow({
        keyEmailToRespond,
        type: composerEvents.REPLY_ALL
      });
    },
    onReportPhishing: async ev => {
      ev.stopPropagation();
      const params = {
        emails: [email.from[0].email],
        type: 'phishing'
      };
      const result = await reportPhishing(params);
      if (result.statusCode !== 200) {
        const messageData = {
          ...Messages.error.reportPhishing,
          description: string.formatString(
            `${Messages.error.reportPhishing.description}`,
            email.from[0].email
          ),
          type: MessageType.ERROR
        };
        sendMailboxEvent(Event.DISPLAY_MESSAGE, messageData);
        return;
      }

      await changeEmailBlockedContact({
        contactId: email.fromContactIds,
        isTrusted: false
      });
      const emailText = email.from[0].email;
      const eventParams = {
        cmd: SocketCommand.PEER_SET_TRUSTED_EMAIL,
        params: {
          email: emailText,
          trusted: false
        }
      };
      await postPeerEvent({ data: eventParams });

      onMarkAsSpam();
    },
    onChangeEmailBlockingContact: async () => {
      await changeEmailBlockedContact({
        contactId: email.fromContactIds,
        isTrusted: true
      });
      const emailText = email.from[0].email;
      const eventParams = {
        cmd: SocketCommand.PEER_SET_TRUSTED_EMAIL,
        params: {
          email: emailText,
          trusted: true
        }
      };
      await postPeerEvent({ data: eventParams });

      dispatch(modifyContactIsTrusted([email.fromContactIds[0]], true));
    },
    onChangeEmailBlockedAccount: async () => {
      await changeEmailBlockedAccount({
        id: email.accountId,
        blockRemoteContent: false
      });
    },
    onUnsendEmail: () => {
      const contactIds = [...email.toIds, ...email.ccIds, ...email.bccIds];
      const unsentDate = new Date();
      const params = {
        key: email.key,
        emailId: email.id,
        contactIds,
        unsentDate
      };
      dispatch(unsendEmail(params));
    },
    onUpdateEmailContent: content => {
      dispatch(updateEmailOnSuccess({ id: email.id, content }));
    },
    onDownloadInlineImages: async (inlineImages, callback) => {
      const cidFilepathPairs = {};
      const metadataKey = email.key;

      const addFilePathToResponseObject = (filePath, cid) => {
        cidFilepathPairs[cid] = filePath;
        if (Object.keys(cidFilepathPairs).length === inlineImages.length)
          callback(cidFilepathPairs);
      };

      const handleSuccessDownloadInlineImage = async ({ token, url }) => {
        const [inlineImage] = inlineImages.filter(img => img.token === token);
        if (inlineImage) {
          const { cid, name } = inlineImage;
          const filename = `${cid}-${name}`;
          const downloadParams = {
            downloadType: 'inline',
            metadataKey,
            filename,
            url
          };
          const { filePath } = await downloadFileInFileSystem(downloadParams);
          if (filePath) addFilePathToResponseObject(filePath, cid);
        }
      };
      setFileSuccessHandler(handleSuccessDownloadInlineImage);

      for (const inlineImg of inlineImages) {
        const { key, iv, cid, name } = inlineImg;
        const filename = `${cid}-${name}`;
        const downloadedPath = await checkFileDownloaded({
          type: 'inline',
          metadataKey,
          filename
        });
        if (downloadedPath === null) {
          setCryptoInterfaces(inlineImg.token, key, iv);
          setDownloadHandler(inlineImg.token);
        } else {
          addFilePathToResponseObject(downloadedPath, cid);
        }
      }
    },
    onInjectFilepathsOnEmailContentByCid: (emailContent, cidFilepathPairs) => {
      const newEmailContent = Object.keys(cidFilepathPairs).reduce(
        (emailContentInjected, cid) => {
          const imgPath = cidFilepathPairs[cid];
          return emailContentInjected.replace(
            `src="cid:${cid}"`,
            defineInjectedSrc(imgPath)
          );
        },
        emailContent
      );
      return newEmailContent;
    }
  };
};

const Email = connect(makeMapStateToProps, mapDispatchToProps)(EmailView);

export default Email;
