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
      labels: [],
      tip: '',
      lastMinDate: undefined
    };
  }

  componentWillReceiveProps(nextProps) {
    if (
      this.props.mailboxSelected !== nextProps.mailboxSelected ||
      this.props.searchParams !== nextProps.searchParams ||
      (nextProps.threadItemsChecked.size === 0 &&
        this.props.threadItemsChecked.size > 0)
    ) {
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
  }

  render() {
    return (
      <Threads
        {...this.props}
        hoverTarget={this.state.hoverTarget}
        labels={this.state.labels}
        onMouseEnterItem={this.handleMouseEnterItem}
        onMouseLeaveItem={this.handleMouseLeaveItem}
        onScroll={this.handleScroll}
        onChangeSwitch={this.handleChangeSwitch}
        tip={this.state.tip}
      />
    );
  }

  componentDidMount() {
    this.props.onLoadThreads(
      this.props.mailboxSelected,
      true,
      this.props.searchParams
    );
    this.props.onLoadEvents();
  }

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
      const date = lastThread.get('minDate');
      if (this.state.lastMinDate !== date) {
        this.setState({ lastMinDate: date }, () => {
          this.props.onLoadThreads(
            this.props.mailboxSelected,
            false,
            this.props.searchParams,
            date
          );
        });
      }
    }
  };

  handleChangeSwitch = ev => {
    this.props.onUnreadToggle(ev.target.checked);
  };
}

ThreadsWrapper.propTypes = {
  mailboxSelected: PropTypes.string,
  onBackOption: PropTypes.func,
  onLoadEvents: PropTypes.func,
  onLoadThreads: PropTypes.func,
  onUnreadToggle: PropTypes.func,
  searchParams: PropTypes.object,
  threadItemsChecked: PropTypes.object,
  threads: PropTypes.object
};

export default ThreadsWrapper;
