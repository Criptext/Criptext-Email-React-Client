import React, { Component } from 'react';
import './threads.css';
import ThreadItem from '../containers/ThreadItem';
import { Switch } from 'react-switch-input';
import ItemTooltip from './ItemTooltip';
import ReactTooltip from 'react-tooltip';
import randomcolor from 'randomcolor';

class ThreadsList extends Component {
  constructor() {
    super();
    this.state = {
      hoverTarget: null,
      tip: ''
    };
  }
  render() {
    return (
      <div className="threads-header-wrapper">
        <div className="threads-info-header">
          <div className="threads-mailbox-label">INBOX</div>
          <div className="threads-toggle-container">
            <span>All</span>
            <Switch
              theme="two"
              name="unreadSwitch"
              onChange={this.handleSwitchChange}
              checked={this.props.unreadFilter}
            />
            <span>Unread</span>
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
                  selectedThread={this.props.selectedThread}
                  onMouseEnterItem={this.onMouseEnterItem}
                  onMouserLeaveItem={this.onMouserLeaveItem}
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
    this.props.onLoadThreads();
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
          const lColor = randomcolor({
            seed: label,
            luminosity: 'bright'
          });
          return (
            <div
              key={label}
              style={{ backgroundColor: lColor }}
              className="innerLabel"
            >
              {this.props.labels.get(label.toString()).get('text')}
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
      this.props.onLoadThreads();
    }
  };
}

export default ThreadsList;
