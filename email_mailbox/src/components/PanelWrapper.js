import React, { Component } from 'react';
import Panel from './Panel';
import PropTypes from 'prop-types';
import { addEvent, Event } from '../utils/electronEventInterface';
import { LabelType } from '../utils/electronInterface';
import { SectionType } from '../utils/const';

class PanelWrapper extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isOpenActivityPanel: false,
      isOpenSideBar: true,
      isOpenWelcome: true,
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

    addEvent(Event.NEW_EMAIL, emailParams => {
      const isRenderingMailbox =
        this.state.sectionSelected.type === SectionType.MAILBOX;
      const isRenderingThread =
        this.state.sectionSelected.type === SectionType.THREAD;
      const currentLabelId =
        LabelType[this.state.sectionSelected.params.mailboxSelected].id;
      const isNewEmailInMailbox =
        emailParams.labels.indexOf(currentLabelId) >= 0;
      if (isNewEmailInMailbox && isRenderingMailbox) {
        props.onLoadThreads({
          labelId: Number(currentLabelId),
          clear: true,
          limit: this.props.threadsCount + 1
        });
      }
      if (isRenderingThread) {
        const newThreadId = emailParams.threadId;
        props.onLoadEmails(newThreadId);
        props.onAddEmailToThread({
          threadId: this.state.sectionSelected.params.threadIdSelected,
          emailId: emailParams.emailId
        });
      }
      props.onUpdateUnreadEmails();
    });

    addEvent(Event.UPDATE_SAVED_DRAFTS, () => {
      const currentLabelId =
        LabelType[this.state.sectionSelected.params.mailboxSelected].id;
      if (currentLabelId === LabelType.draft.id) {
        props.onLoadThreads({
          labelId: Number(currentLabelId),
          contactTypes: ['to'],
          clear: true,
          limit: this.props.threadsCount + 1
        });
      }
    });

    addEvent(Event.UPDATE_THREAD_EMAILS, eventParams => {
      const newThreadId = eventParams.threadId;
      props.onLoadEmails(newThreadId);
      props.onAddEmailToThread({
        threadId: this.state.sectionSelected.params.threadIdSelected,
        emailId: eventParams.emailId
      });
      props.onUpdateUnreadEmails();
    });
  }

  render() {
    return (
      <Panel
        isOpenActivityPanel={this.state.isOpenActivityPanel}
        isOpenSideBar={this.state.isOpenSideBar}
        isOpenWelcome={this.state.isOpenWelcome}
        onClickCloseWelcome={this.handleCloseWelcome}
        onClickSection={this.handleClickSection}
        onClickThreadBack={this.handleClickThreadBack}
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
          const { mailboxSelected, threadIdSelected } = params;
          this.setState(state => ({
            ...state,
            sectionSelected: {
              type,
              params: {
                mailboxSelected,
                threadIdSelected,
                searchParams: { ...state.sectionSelected.params.searchParams }
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
}

PanelWrapper.propTypes = {
  onAddEmailToThread: PropTypes.func,
  onLoadEmails: PropTypes.func,
  onLoadThreads: PropTypes.func,
  onUpdateOpenedAccount: PropTypes.func,
  onUpdateTimestamp: PropTypes.func,
  onUpdateUnreadEmails: PropTypes.func,
  threadsCount: PropTypes.number
};

export default PanelWrapper;
