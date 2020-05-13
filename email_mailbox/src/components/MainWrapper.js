import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Set } from 'immutable';
import HeaderHOC from './HeaderHOC';
import HeaderMainBasic from './../containers/HeaderMain';
import HeaderThreadOptionsBasic from './../containers/HeaderThreadOptions';
import Threads from '../containers/Threads';
import Thread from '../containers/Thread';
import SettingsContainer from './../containers/SettingsContainer';
import { SectionType } from '../utils/const';
import { addEvent, Event, removeEvent } from '../utils/electronEventInterface';

const HeaderMain = HeaderHOC(HeaderMainBasic);
const HeaderThreadOptions = HeaderHOC(HeaderThreadOptionsBasic);

class MainWrapper extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isUpdateAvailable: false,
      threadItemsChecked: Set()
    };

    this.initEventHandlers(props);
  }

  render() {
    return (
      <div className="main-container">
        {this.renderHeader()}
        {this.renderSection()}
      </div>
    );
  }

  renderHeader = () => {
    switch (this.props.sectionSelected.type) {
      case SectionType.MAILBOX: {
        if (this.state.threadItemsChecked.size) {
          return (
            <HeaderThreadOptions
              mailboxSelected={
                this.props.sectionSelected.params.mailboxSelected
              }
              onToggleActivityPanel={this.props.onToggleActivityPanel}
              onBackOption={this.handleClickBackHeaderMailbox}
              onCheckAllThreadItems={this.handleCheckAllThreadItems}
              itemsChecked={this.state.threadItemsChecked}
            />
          );
        }
        return (
          <HeaderMain
            onClickSection={this.props.onClickSection}
            onToggleActivityPanel={this.props.onToggleActivityPanel}
            sectionSelected={this.props.sectionSelected}
            onUpdateApp={this.props.onUpdateApp}
          />
        );
      }
      case SectionType.THREAD: {
        return (
          <HeaderThreadOptions
            mailboxSelected={this.props.sectionSelected.params.mailboxSelected}
            onBackOption={() =>
              this.handleClickBackHeaderThread(
                this.props.sectionSelected.params.mailboxSelected,
                this.props.onClickSection
              )
            }
            onToggleActivityPanel={this.props.onToggleActivityPanel}
            threadIdSelected={
              this.props.sectionSelected.params.threadIdSelected
            }
          />
        );
      }
      case SectionType.SETTINGS: {
        return (
          <HeaderMain
            onClickSection={this.props.onClickSection}
            onToggleActivityPanel={this.props.onToggleActivityPanel}
            onUpdateApp={this.props.onUpdateApp}
          />
        );
      }
      default:
        break;
    }
  };

  renderSection = () => {
    switch (this.props.sectionSelected.type) {
      case SectionType.SETTINGS: {
        return (
          <SettingsContainer
            onClickSection={this.props.onClickSection}
            onUpdateApp={this.props.onUpdateApp}
          />
        );
      }
      default:
        return this.renderThreads();
    }
  };

  renderThreads = () => {
    const isThreadsVisible =
      this.props.sectionSelected.type === SectionType.MAILBOX;
    const isThreadVisible =
      this.props.sectionSelected.type === SectionType.THREAD;
    if (isThreadsVisible || isThreadVisible) {
      return (
        <div className="content-container">
          <Threads
            isUpdateAvailable={this.state.isUpdateAvailable}
            isVisible={!isThreadVisible}
            mailboxSelected={this.props.sectionSelected.params.mailboxSelected}
            onBackOption={this.handleClickBackHeaderMailbox}
            onClickSection={this.props.onClickSection}
            onCheckThreadItem={this.handleCheckThreadItem}
            onCloseUpdateMessage={this.handleCloseUpdateMessage}
            searchParams={this.props.sectionSelected.params.searchParams}
            threadItemsChecked={this.state.threadItemsChecked}
          />
          {isThreadVisible && (
            <Thread
              mailboxSelected={
                this.props.sectionSelected.params.mailboxSelected
              }
              onBackOption={() =>
                this.handleClickBackHeaderThread(
                  this.props.sectionSelected.params.mailboxSelected,
                  this.props.onClickSection
                )
              }
              onClickSection={this.props.onClickSection}
              threadIdSelected={
                this.props.sectionSelected.params.threadIdSelected
              }
              onClickSelectedItem={this.props.onClickSection}
            />
          )}
        </div>
      );
    }
    return;
  };

  handleCheckAllThreadItems = (value, threadIds) => {
    if (!value) this.setState({ threadItemsChecked: threadIds });
    else this.setState({ threadItemsChecked: Set() });
  };

  handleCheckThreadItem = (threadId, value) => {
    if (value)
      this.setState(state => ({
        threadItemsChecked: state.threadItemsChecked.add(threadId)
      }));
    else
      this.setState(state => ({
        threadItemsChecked: state.threadItemsChecked.delete(threadId)
      }));
  };

  handleClickBackHeaderMailbox = () => {
    this.setState({ threadItemsChecked: Set() });
  };

  handleClickBackHeaderThread = (mailboxSelected, onClickSection) => {
    const type = SectionType.MAILBOX;
    const params = {
      mailboxSelected
    };
    onClickSection(type, params);
  };

  handleCloseUpdateMessage = () => {
    this.setState({ isUpdateAvailable: false });
  };

  initEventHandlers = () => {
    addEvent(Event.UPDATE_AVAILABLE, this.updateAvailableListenerCallback);
  };

  removeEventHandlers = () => {
    removeEvent(Event.UPDATE_AVAILABLE, this.updateAvailableListenerCallback);
  };

  updateAvailableListenerCallback = ({ value }) => {
    if (value) {
      this.setState({ isUpdateAvailable: value });
    }
  };
}

MainWrapper.propTypes = {
  onClickSection: PropTypes.func,
  onToggleActivityPanel: PropTypes.func,
  onUpdateApp: PropTypes.func,
  sectionSelected: PropTypes.object
};

export default MainWrapper;
