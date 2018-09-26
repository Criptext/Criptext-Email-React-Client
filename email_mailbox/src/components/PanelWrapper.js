import React, { Component } from 'react';
import Panel from './Panel';
import PropTypes from 'prop-types';
import { addEvent, Event } from '../utils/electronEventInterface';
import { LabelType } from '../utils/electronInterface';
import { SectionType, EmailStatus } from '../utils/const';

const MAILBOX_POPUP_TYPES = {
  DEVICE_REMOVED: 'device-removed',
  PASSWORD_CHANGED: 'password-changed'
};

class PanelWrapper extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isOpenActivityPanel: false,
      isOpenSideBar: true,
      isOpenWelcome: true,
      isHiddenMailboxPopup: true,
      mailboxPopupType: undefined,
      sectionSelected: {
        type: SectionType.MAILBOX,
        params: {
          mailboxSelected: 'inbox',
          threadIdSelected: null,
          searchParams: {
            text: '',
            from: '',
            to: '',
            subject: '',
            hasAttachments: false
          }
        }
      }
    };
    this.initEventHandlers(props);
  }

  render() {
    return (
      <Panel
        isHiddenMailboxPopup={this.state.isHiddenMailboxPopup}
        isOpenActivityPanel={this.state.isOpenActivityPanel}
        isOpenSideBar={this.state.isOpenSideBar}
        isOpenWelcome={this.state.isOpenWelcome}
        mailboxPopupType={this.state.mailboxPopupType}
        onClickCloseWelcome={this.handleCloseWelcome}
        onClickSection={this.handleClickSection}
        onClickThreadBack={this.handleClickThreadBack}
        onCloseMailboxPopup={this.handleCloseMailboxPopup}
        onToggleActivityPanel={this.handleToggleActivityPanel}
        onToggleSideBar={this.handleToggleSideBar}
        sectionSelected={this.state.sectionSelected}
        {...this.props}
      />
    );
  }

  handleClickSection = (type, params) => {
    switch (type) {
      case SectionType.MAILBOX:
        {
          const { mailboxSelected, searchParams } = params;
          const searchParamsChecked =
            searchParams || this.state.sectionSelected.params.searchParams;
          this.setState(state => ({
            ...state,
            sectionSelected: {
              type,
              params: {
                mailboxSelected,
                threadIdSelected: null,
                searchParams: searchParamsChecked
              }
            }
          }));
        }
        break;
      case SectionType.THREAD:
        {
          const { mailboxSelected, threadIdSelected, searchParams } = params;
          this.setState(state => ({
            ...state,
            sectionSelected: {
              type,
              params: {
                mailboxSelected,
                threadIdSelected,
                searchParams
              }
            }
          }));
        }
        break;
      case SectionType.SETTINGS:
        {
          const sectionSelected = {
            type,
            params: {
              mailboxSelected: null,
              threadIdSelected: null
            }
          };
          this.setState({ sectionSelected });
        }
        break;
      default:
        break;
    }
  };

  handleClickThreadBack = () => {
    this.setState({ threadIdSelected: null });
  };

  handleToggleActivityPanel = () => {
    this.setState(
      { isOpenActivityPanel: !this.state.isOpenActivityPanel },
      () => {
        if (this.state.isOpenActivityPanel === false) {
          this.props.onUpdateTimestamp();
        }
      }
    );
  };

  handleToggleSideBar = () => {
    this.setState({ isOpenSideBar: !this.state.isOpenSideBar });
  };

  handleCloseWelcome = () => {
    this.setState({ isOpenWelcome: false }, () => {
      this.props.onUpdateOpenedAccount();
    });
  };

  handleCloseMailboxPopup = () => {
    this.setState({
      isHiddenMailboxPopup: true,
      mailboxPopupType: undefined
    });
  };

  initEventHandlers = props => {
    addEvent(Event.NEW_EMAIL, emailParams => {
      const { emailId, labels, threadId } = emailParams;
      const currentSectionType = this.state.sectionSelected.type;
      const isRenderingMailbox = currentSectionType === SectionType.MAILBOX;
      const isRenderingThread = currentSectionType === SectionType.THREAD;
      const currentLabelId =
        LabelType[this.state.sectionSelected.params.mailboxSelected].id;
      const isNewEmailInMailbox = labels.includes(currentLabelId);
      const currentThreadId = this.state.sectionSelected.params
        .threadIdSelected;
      if (isRenderingMailbox && isNewEmailInMailbox) {
        props.onLoadThreads({
          labelId: Number(currentLabelId),
          clear: true
        });
      } else if (isRenderingThread && threadId === currentThreadId) {
        props.onLoadEmails(threadId);
        props.onUpdateEmailIdsThread({
          threadId,
          emailIdToAdd: emailId
        });
      }
      props.onUpdateUnreadEmailsBadge(labels);
    });

    addEvent(Event.LOAD_EVENTS, () => {
      this.props.onLoadEvents();
    });

    addEvent(Event.REFRESH_THREADS, eventParams => {
      if (this.state.sectionSelected.params.mailboxSelected) {
        const currentLabelId =
          LabelType[this.state.sectionSelected.params.mailboxSelected].id;
        props.onLoadThreads({
          labelId: Number(currentLabelId),
          clear: true
        });
      }
      if (this.state.sectionSelected.params.threadIdSelected) {
        props.onLoadEmails(this.state.sectionSelected.params.threadIdSelected);
      }
      if (eventParams) {
        const { labelIds } = eventParams;
        props.onUpdateUnreadEmailsBadge(labelIds);
      }
    });

    addEvent(
      Event.EMAIL_TRACKING_UPDATE,
      ({ threadId, emailId, status, date }) => {
        const currentSectionType = this.state.sectionSelected.type;
        const isRenderingMailbox = currentSectionType === SectionType.MAILBOX;
        if (status === EmailStatus.OPENED && isRenderingMailbox) {
          props.onMarkThreadAsOpen(threadId, status);
        }
        if (status === EmailStatus.UNSEND) {
          const isRenderingThread = currentSectionType === SectionType.THREAD;
          if (isRenderingMailbox) {
            const currentLabelId =
              LabelType[this.state.sectionSelected.params.mailboxSelected].id;
            props.onLoadThreads({
              labelId: Number(currentLabelId),
              clear: true,
              limit: props.threadsCount
            });
          }
          if (isRenderingThread) {
            props.onUnsendEmail(emailId, date, status);
          }
        }
      }
    );

    addEvent(Event.UPDATE_THREAD_EMAILS, eventParams => {
      const { threadId, newEmailId, oldEmailId } = eventParams;
      props.onLoadEmails(threadId);
      props.onUpdateEmailIdsThread({
        threadId,
        emailIdToAdd: newEmailId,
        emailIdsToRemove: [oldEmailId]
      });
      if (!newEmailId && !oldEmailId) {
        props.onUpdateUnreadEmailsBadge([LabelType.inbox.id]);
      }
    });

    addEvent(Event.EMAIL_DELETED, emailIds => {
      if (emailIds.length) {
        const currentThreadId = this.state.sectionSelected.params
          .threadIdSelected;
        props.onUpdateEmailIdsThread({
          threadId: currentThreadId,
          emailIdsToRemove: emailIds
        });
      }
    });

    addEvent(Event.THREADS_DELETED, threadIds => {
      const isRenderingMailbox =
        this.state.sectionSelected.type === SectionType.MAILBOX;
      if (threadIds.length && isRenderingMailbox) {
        props.onRemoveThreads(threadIds);
      }
    });

    addEvent(Event.THREADS_UPDATE_READ, (threadIds, unread) => {
      props.onUpdateUnreadThreads(threadIds, unread);
    });

    addEvent(Event.DEVICE_REMOVED, () => {
      this.setState({
        isHiddenMailboxPopup: false,
        mailboxPopupType: MAILBOX_POPUP_TYPES.DEVICE_REMOVED
      });
    });

    addEvent(Event.PASSWORD_CHANGED, () => {
      this.setState({
        isHiddenMailboxPopup: false,
        mailboxPopupType: MAILBOX_POPUP_TYPES.PASSWORD_CHANGED
      });
    });

    addEvent(Event.LABEL_CREATED, labels => {
      this.props.onAddLabels(labels);
    });
  };
}

PanelWrapper.propTypes = {
  onAddLabels: PropTypes.func,
  onLoadEmails: PropTypes.func,
  onLoadEvents: PropTypes.func,
  onMarkThreadAsOpen: PropTypes.func,
  onLoadThreads: PropTypes.func,
  onRemoveEmailIdToThread: PropTypes.func,
  onUnsendEmail: PropTypes.func,
  onUpdateEmailIdsThread: PropTypes.func,
  onUpdateOpenedAccount: PropTypes.func,
  onUpdateTimestamp: PropTypes.func,
  onUpdateUnreadEmailsBadge: PropTypes.func,
  onUpdateUnreadThreads: PropTypes.func,
  threadsCount: PropTypes.number
};

export { PanelWrapper as default, MAILBOX_POPUP_TYPES };
