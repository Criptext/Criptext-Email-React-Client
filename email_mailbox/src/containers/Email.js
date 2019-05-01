import { connect } from 'react-redux';
import { makeGetFiles } from './../selectors/files';
import EmailView from './../components/EmailWrapper';
import {
  defineTimeByToday,
  defineLargeTime,
  defineUnsentText
} from './../utils/TimeUtils';
import { getTwoCapitalLetters, hasAnySubstring } from './../utils/StringUtils';
import { matchOwnEmail } from './../utils/ContactUtils';
import { addCollapseDiv } from './../utils/EmailUtils';
import randomcolor from 'randomcolor';
import { LabelType, myAccount, mySettings } from './../utils/electronInterface';
import {
  openFilledComposerWindow,
  sendPrintEmailEvent,
  sendOpenEmailSource,
  downloadFileInFileSystem,
  checkFileDownloaded
} from './../utils/ipc';
import {
  markEmailUnread,
  removeEmails,
  unsendEmail,
  updateEmailLabels,
  updateEmailOnSuccess
} from './../actions/index';
import {
  EmailStatus,
  composerEvents,
  appDomain,
  avatarBaseUrl
} from '../utils/const';
import {
  setFileSuccessHandler,
  setCryptoInterfaces,
  setDownloadHandler
} from '../utils/FileManager';
import string from './../lang';

const definePreviewAndContent = (email, isCollapse, inlineImages) => {
  if (email.status === EmailStatus.UNSEND) {
    const unsentText = defineUnsentText(email.unsendDate);
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
      : addCollapseDiv(email.content, email.key, isCollapse)
  };
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
    const recipient = senderEmail.replace(`@${appDomain}`, '');
    const avatarUrl = senderEmail.includes(`@${appDomain}`)
      ? `${avatarBaseUrl}${recipient}?date=${avatarTimestamp}`
      : null;
    const date = email.date;
    const { files, inlineImages } = getFiles(state, email);
    const isCollapse = !!hasAnySubstring(['Re:', 'RE:'], email.subject);
    const { preview, content } = definePreviewAndContent(
      email,
      isCollapse,
      inlineImages
    );
    const isEmpty = !(email.content && email.content.length);
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
      color,
      content,
      date: defineTimeByToday(date),
      dateLong: defineLargeTime(date),
      email,
      files,
      isSpam,
      isTrash,
      isDraft,
      isEmpty,
      isFromMe: matchOwnEmail(myAccount.recipientId, senderEmail),
      isUnsend,
      inlineImages,
      letters,
      preview
    };
  };
  return mapStateToProps;
};

const mapDispatchToProps = (dispatch, ownProps) => {
  const email = ownProps.email;
  const isLast = ownProps.staticOpen;
  return {
    onEditDraft: () => {
      const key = email.key;
      openFilledComposerWindow({
        accountId: myAccount.id,
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
    onMarkAsSpam: ev => {
      ev.stopPropagation();
      const labelsAdded = [LabelType.spam.text];
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
    onMarkUnread: ev => {
      ev.stopPropagation();
      const labelId = ownProps.mailboxSelected.id;
      dispatch(markEmailUnread(labelId, email.threadId, email.id, true)).then(
        () => ownProps.onBackOption()
      );
    },
    onOpenEmailSource: ev => {
      ev.stopPropagation();
      sendOpenEmailSource(email.key);
    },
    onPrintEmail: ev => {
      ev.stopPropagation();
      sendPrintEmailEvent(email.id);
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
    onUnsendEmail: () => {
      const contactIds = [...email.toIds, ...email.ccIds, ...email.bccIds];
      const unsendDate = new Date();
      const params = {
        key: email.key,
        emailId: email.id,
        contactIds,
        unsendDate
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
          const filePath = await downloadFileInFileSystem(downloadParams);
          addFilePathToResponseObject(filePath, cid);
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
          setCryptoInterfaces(key, iv);
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
  makeMapStateToProps,
  mapDispatchToProps
)(EmailView);

export default Email;
