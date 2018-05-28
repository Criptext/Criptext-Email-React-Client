import React, { Component } from 'react';
import PropTypes from 'prop-types';
import HeaderHOC from './HeaderHOC';
import HeaderMainBasic from './../containers/HeaderMain';
import HeaderBasicThreadOptions from './../containers/ThreadHeader';
import Threads from '../containers/Threads';
import Thread from '../containers/Thread';
import Settings from './Settings';
import { SectionType } from '../utils/const';
import { Set } from 'immutable';

const HeaderMain = HeaderHOC(HeaderMainBasic);
const HeaderThreadOptions = HeaderHOC(HeaderBasicThreadOptions);

class MainWrapper extends Component {
  constructor(props) {
    super(props);
    this.state = {
      threadItemsChecked: Set()
    };
  }

  render() {
    return (
      <div className="main-container">
        {this.renderHeader()}
        {this.renderSection()}
      </div>
    );
  }

  handleCheckAllThreadItems = (value, threadIds) => {
    if (!value) this.setState({ threadItemsChecked: threadIds });
    else this.setState({ threadItemsChecked: Set() });
  };

  handleCheckThreadItem = (threadId, value) => {
    if (value)
      this.setState({
        threadItemsChecked: this.state.threadItemsChecked.add(threadId)
      });
    else
      this.setState({
        threadItemsChecked: this.state.threadItemsChecked.delete(threadId)
      });
  };

  handleClickBackHeaderMailbox = () => {
    this.setState({
      threadItemsChecked: this.state.threadItemsChecked.clear()
    });
  };

  handleClickBackHeaderThread = (mailboxSelected, onClickSection) => {
    const type = SectionType.MAILBOX;
    const params = {
      mailboxSelected
    };
    onClickSection(type, params);
  };

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
          />
        );
      }
      default:
        break;
    }
  };

  renderSection = () => {
    switch (this.props.sectionSelected.type) {
      case SectionType.MAILBOX: {
        return (
          <Threads
            mailboxSelected={this.props.sectionSelected.params.mailboxSelected}
            onClickSection={this.props.onClickSection}
            onCheckThreadItem={this.handleCheckThreadItem}
            searchParams={{ ...this.props.sectionSelected.params.searchParams }}
            threadItemsChecked={this.state.threadItemsChecked}
          />
        );
      }
      case SectionType.THREAD: {
        return (
          <Thread
            mailboxSelected={this.props.sectionSelected.params.mailboxSelected}
            threadIdSelected={
              this.props.sectionSelected.params.threadIdSelected
            }
          />
        );
      }
      case SectionType.SETTINGS: {
        return <Settings />;
      }
      default:
        break;
    }
  };
}

MainWrapper.propTypes = {
  onClickSection: PropTypes.func,
  onToggleActivityPanel: PropTypes.func,
  sectionSelected: PropTypes.object
};

export default MainWrapper;
