import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ThreadItem from '../containers/ThreadItem';
import { Switch } from 'react-switch-input';
import ButtonSync from './ButtonSync';
import ItemTooltip from './ItemTooltip';
import ReactTooltip from 'react-tooltip';
import './threads.css';

class Threads extends Component {
  constructor() {
    super();
    this.state = {
      hoverTarget: null,
      tip: ''
    };
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.mailbox !== nextProps.mailbox) {
      this.props.onLoadThreads(nextProps.mailbox, true);
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
            {this.props.threads.map((thread, index) => {
              return (
                <ThreadItem
                  key={index}
                  myIndex={index}
                  mailbox={this.props.mailbox}
                  thread={thread}
                  onClickThreadIdSelected={this.props.onClickThreadIdSelected}
                  onMouseEnterItem={this.onMouseEnterItem}
                  onMouserLeaveItem={this.onMouserLeaveItem}
                  searchParams={this.props.searchParams}
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
    this.props.onLoadThreads(this.props.mailbox, true);
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

  onMouseEnterItem = (id, data) => {
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

  onMouserLeaveItem = id => {
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

    if (scrollTop + height > scrollHeight - 25) {
      const lastThread = this.props.threads.last();
      const timestamp = lastThread.get('timestamp');
      this.props.onLoadThreads(this.props.mailbox, false, timestamp);
    }
  };
}

Threads.propTypes = {
  buttonSyncStatus: PropTypes.string,
  mailbox: PropTypes.string,
  mailboxTitle: PropTypes.string,
  onClickThreadIdSelected: PropTypes.func,
  onLoadEvents: PropTypes.func,
  onLoadThreads: PropTypes.func,
  onUnreadToggle: PropTypes.func,
  searchParams: PropTypes.object,
  threads: PropTypes.object,
  unreadFilter: PropTypes.bool
};

export default Threads;
