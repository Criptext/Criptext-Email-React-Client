/* eslint react/no-deprecated: 0 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Threads from './Threads';

const SCROLL_BOTTOM_LIMIT = 25;

class ThreadsWrapper extends Component {
  constructor() {
    super();
    this.state = {
      hoverTarget: null,
      isHiddenLoadingSync: true,
      labels: [],
      lastMinDate: undefined,
      tip: '',
      popupContent: undefined
    };
  }

  componentWillReceiveProps(nextProps) {
    if (
      this.props.mailboxSelected !== nextProps.mailboxSelected ||
      this.props.searchParams !== nextProps.searchParams ||
      (nextProps.threadItemsChecked.size === 0 &&
        this.props.threadItemsChecked.size > 0)
    ) {
      this.setState({ lastMinDate: undefined });
      this.props.onLoadThreads(
        nextProps.mailboxSelected,
        true,
        nextProps.searchParams
      );
    }
    if (
      this.props.threadItemsChecked.size > 0 &&
      this.props.mailboxSelected !== nextProps.mailboxSelected
    ) {
      this.props.onBackOption();
    }

    if (
      this.state.isHiddenLoadingSync &&
      nextProps.totalTask > nextProps.completedTask
    ) {
      this.setState({ isHiddenLoadingSync: false });
    }
    if (
      !this.state.isHiddenLoadingSync &&
      nextProps.totalTask > 0 &&
      nextProps.completedTask > 0 &&
      (nextProps.totalTask === nextProps.completedTask ||
        nextProps.completedTask > nextProps.totalTask)
    ) {
      setTimeout(() => this.setState({ isHiddenLoadingSync: true }), 1000);
    }
  }

  render() {
    return (
      <Threads
        {...this.props}
        hoverTarget={this.state.hoverTarget}
        isHiddenLoadingSync={this.state.isHiddenLoadingSync}
        labels={this.state.labels}
        onCloseMessage={this.handleCloseMessage}
        onMouseEnterItem={this.handleMouseEnterItem}
        onMouseLeaveItem={this.handleMouseLeaveItem}
        onScroll={this.handleScroll}
        onChangeSwitch={this.handleChangeSwitch}
        tip={this.state.tip}
        popupContent={this.state.popupContent}
        setPopupContent={this.setPopupContent}
        dismissPopup={this.dismissPopup}
        handlePopupConfirm={this.handlePopupConfirm}
      />
    );
  }

  componentDidMount() {
    if (!this.props.threads.size)
      this.props.onLoadApp(this.props.mailboxSelected, true);
  }

  handleCloseMessage = () => {
    if (this.props.isUpdateAvailable) {
      this.props.onCloseUpdateMessage();
    }
  };

  handleMouseEnterItem = (id, data) => {
    if (typeof data === 'string') {
      return this.setState({
        hoverTarget: id,
        tip: data
      });
    }

    this.setState({
      hoverTarget: id,
      labels: data
    });
  };

  handleMouseLeaveItem = id => {
    if (id !== this.state.hoverTarget) {
      return;
    }

    this.setState({
      hoverTarget: null,
      tip: '',
      labels: null
    });
  };

  handleScroll = e => {
    const scrollTop = e.target.scrollTop;
    const height = e.target.clientHeight;
    const scrollHeight = e.target.scrollHeight;
    const lastThread = this.props.threads.last();
    if (scrollTop + height > scrollHeight - SCROLL_BOTTOM_LIMIT && lastThread) {
      const date = lastThread.get('maxDate');
      const threadIdRejected = lastThread.get('threadId');
      if (this.state.lastMinDate !== date) {
        const unreadSwitchStatus = this.props.switchChecked;
        const unread =
          unreadSwitchStatus === true ? unreadSwitchStatus : undefined;
        this.setState({ lastMinDate: date }, () => {
          this.props.onLoadThreads(
            this.props.mailboxSelected,
            false,
            this.props.searchParams,
            date,
            threadIdRejected,
            unread
          );
        });
      }
    }
  };

  handleChangeSwitch = ev => {
    const checked = ev.target.checked;
    const { currentUnreadThreadsLength, mailboxSelected } = this.props;
    const loadParams = {
      clear: true,
      unread: checked === true ? checked : undefined
    };
    this.props.onUnreadToggle(
      checked,
      currentUnreadThreadsLength,
      mailboxSelected,
      loadParams
    );
  };

  handlePopupConfirm = () => {
    this.setState({ popupContent: undefined }, this.props.onEmptyTrash);
  };

  setPopupContent = popupContent => {
    this.setState({ popupContent });
  };

  dismissPopup = () => {
    this.setState({ popupContent: undefined });
  };
}

ThreadsWrapper.propTypes = {
  completedTask: PropTypes.number,
  currentUnreadThreadsLength: PropTypes.number,
  isUpdateAvailable: PropTypes.bool,
  mailboxSelected: PropTypes.object,
  onBackOption: PropTypes.func,
  onCloseUpdateMessage: PropTypes.func,
  onEmptyTrash: PropTypes.func,
  onLoadApp: PropTypes.func,
  onLoadThreads: PropTypes.func,
  onUnreadToggle: PropTypes.func,
  searchParams: PropTypes.object,
  switchChecked: PropTypes.bool,
  threadItemsChecked: PropTypes.object,
  threads: PropTypes.object,
  totalTask: PropTypes.number
};

export default ThreadsWrapper;
