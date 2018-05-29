import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ThreadItem from '../containers/ThreadItem';
import { Switch } from 'react-switch-input';
import ButtonSync from './ButtonSync';
import ItemTooltip from './ItemTooltip';
import ReactTooltip from 'react-tooltip';
import './threads.css';
import EmptyMailbox from './EmptyMailbox';

const SCROLL_BOTTOM_LIMIT = 25;

class Threads extends Component {
  constructor() {
    super();
    this.state = {
      hoverTarget: null,
      tip: ''
    };
  }

  componentWillReceiveProps(nextProps) {
    if (
      this.props.mailboxSelected !== nextProps.mailboxSelected ||
      this.props.searchParams !== nextProps.searchParams
    ) {
      this.props.onLoadThreads(
        nextProps.mailboxSelected,
        true,
        nextProps.searchParams
      );
    }
  }

  render() {
    return (
      <div className="threads-header-wrapper">
        <div className="threads-info-header">
          <div className="threads-mailbox-title-container">
            <h1 className="threads-mailbox-title">{this.props.mailboxTitle}</h1>
            <ButtonSync
              onClick={this.props.onLoadEvents}
              status={this.props.buttonSyncStatus}
            />
          </div>
          <div className="threads-toggle-container">
            <span className={this.props.unreadFilter ? 'disabled' : ''}>
              All
            </span>
            <Switch
              theme="two"
              name="unreadSwitch"
              onChange={this.handleSwitchChange}
              checked={this.props.unreadFilter}
            />
            <span className={this.props.unreadFilter ? '' : 'disabled'}>
              Unread
            </span>
          </div>
        </div>
        <div className="threads-wrapper" onScroll={this.handleTableScrolled}>
          <div className="threads-container">
            {this.props.threads.size < 1 ? (
              <EmptyMailbox mailbox={this.props.mailboxSelected} />
            ) : null}
            {this.props.threads.map((thread, index) => {
              const checked = this.props.threadItemsChecked.has(
                thread.get('id')
              );
              return (
                <ThreadItem
                  key={index}
                  myIndex={index}
                  checked={checked}
                  mailbox={this.props.mailboxSelected} // ?
                  thread={thread}
                  onClickSelectedItem={this.props.onClickSection}
                  onMouseEnterItem={this.handleMouseEnterItem}
                  onMouserLeaveItem={this.handleMouserLeaveItem}
                  searchParams={this.props.searchParams}
                  onCheckItem={this.props.onCheckThreadItem}
                  isHiddenCheckBox={!this.props.threadItemsChecked.size}
                />
              );
            })}
          </div>
        </div>
        {this.renderTooltipForThread()}
        {this.renderLabelsForThread()}
      </div>
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

  renderTooltipForThread = () => {
    if (!this.state.hoverTarget || !this.state.tip) {
      return null;
    }

    return <ItemTooltip target={this.state.hoverTarget} tip={this.state.tip} />;
  };

  renderLabelsForThread = () => {
    const labels = this.state.labels;
    if (!labels) {
      return null;
    }

    return (
      <ReactTooltip
        place="top"
        className="labels-tooltip"
        id={this.state.hoverTarget}
        type="dark"
        effect="solid"
      >
        {labels.map(label => {
          return (
            <div
              key={label.id}
              style={{ backgroundColor: label.color }}
              className="innerLabel"
            >
              {label.text}
            </div>
          );
        })}
        <div className="tooltip-tip"> </div>
      </ReactTooltip>
    );
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

  handleMouserLeaveItem = id => {
    if (id !== this.state.hoverTarget) {
      return;
    }

    this.setState({
      hoverTarget: null,
      tip: '',
      labels: null
    });
  };

  handleSwitchChange = ev => {
    this.props.onUnreadToggle(ev.target.checked);
  };

  handleTableScrolled = e => {
    const scrollTop = e.target.scrollTop;
    const height = e.target.clientHeight;
    const scrollHeight = e.target.scrollHeight;
    const lastThread = this.props.threads.last();

    if (scrollTop + height > scrollHeight - SCROLL_BOTTOM_LIMIT && lastThread) {
      const timestamp = lastThread.get('timestamp');
      this.props.onLoadThreads(
        this.props.mailboxSelected,
        false,
        this.props.searchParams,
        timestamp
      );
    }
  };
}

Threads.propTypes = {
  buttonSyncStatus: PropTypes.number,
  mailboxSelected: PropTypes.string,
  mailboxTitle: PropTypes.string,
  onCheckThreadItem: PropTypes.func,
  onClickSection: PropTypes.func,
  onLoadEvents: PropTypes.func,
  onLoadThreads: PropTypes.func,
  onUnreadToggle: PropTypes.func,
  searchParams: PropTypes.object,
  threadItemsChecked: PropTypes.object,
  threads: PropTypes.object,
  unreadFilter: PropTypes.bool
};

export default Threads;
