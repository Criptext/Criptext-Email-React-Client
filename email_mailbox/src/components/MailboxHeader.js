import React, { Component } from 'react';
import PropTypes from 'prop-types';
import HeaderThreadOptionsWrapper from './HeaderThreadOptionsWrapper';
import HeaderMain from './HeaderMain';
import ActivityPanelShortCut from './ActivityPanelShortCut';
import './mailboxheader.css';

class MailboxHeader extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isHiddenMenuSearchHints: true,
      isHiddenMenuSearchOptions: true,
      searchParams: {
        text: '',
        from: '',
        to: '',
        subject: '',
        hasAttachments: false
      }
    };
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.multiselect !== nextProps.multiselect) {
      this.setState({
        isHiddenMenuSearchHints: true,
        isHiddenMenuSearchOptions: true
      });
    }
  }

  render() {
    const threads = this.props.threadsSuggestions;
    return (
      <header className="mailbox-header">
        <div className="header-container">
          {this.props.multiselect ? (
            <HeaderThreadOptionsWrapper {...this.props} />
          ) : (
            <HeaderMain
              {...this.props}
              threads={threads}
              getSearchParams={this.handleGetSearchParams}
              searchParams={this.state.searchParams}
              isHiddenMenuSearchHints={this.state.isHiddenMenuSearchHints}
              isHiddenMenuSearchOptions={this.state.isHiddenMenuSearchOptions}
              onToggleMenuSearchHints={this.handleToggleMenuSearchHints}
              onToggleMenuSearchOptions={this.handleToggleMenuSearchOptions}
              onTriggerSearch={this.handleTriggerSearch}
              onSearchThreads={this.onSearchThreads}
              onSearchSelectThread={this.props.onSearchSelectThread}
            />
          )}
        </div>
        <ActivityPanelShortCut onClick={this.props.onToggleActivityPanel} />
      </header>
    );
  }

  onSearchThreads = () => {
    this.setState(
      {
        isHiddenMenuSearchOptions: true
      },
      () => {
        if (this.state.searchParams.from && this.state.searchParams.to) {
          this.props.onSearchThreads({
            contactTypes: ['from', 'to'],
            contactFilter: {
              from: this.state.searchParams.from,
              to: this.state.searchParams.to
            },
            ...this.state.searchParams
          });
          return;
        }
        if (this.state.searchParams.from) {
          this.props.onSearchThreads({
            contactTypes: ['from'],
            contactFilter: {
              from: this.state.searchParams.from
            },
            ...this.state.searchParams
          });
          return;
        }
        if (this.state.searchParams.to) {
          this.props.onSearchThreads({
            contactTypes: ['to'],
            contactFilter: {
              to: this.state.searchParams.to
            },
            ...this.state.searchParams
          });
          return;
        }
        this.props.onSearchThreads(this.state.searchParams);
      }
    );
  };

  handleTriggerSearch = () => {
    if (
      !this.state.isHiddenMenuSearchOptions ||
      !this.state.searchParams.text
    ) {
      return this.setState({
        isHiddenMenuSearchHints: true
      });
    }

    this.setState(
      {
        isHiddenMenuSearchHints: true
      },
      () => {
        this.props.setSearchParams(this.state.searchParams);
        this.props.onSearchThreads({
          text: this.state.searchParams.text,
          plain: true
        });
      }
    );
  };

  handleGetSearchParams = (key, value) => {
    const isHiddenMenuSearchHints =
      key === 'text'
        ? this.state.isHiddenMenuSearchOptions ? false : true
        : true;
    const searchParams = this.state.searchParams;
    searchParams[key] = value;
    this.setState(
      {
        searchParams,
        isHiddenMenuSearchHints
      },
      () => {
        if (!isHiddenMenuSearchHints && key === 'text') {
          this.props.onSearchChange(value);
        }
      }
    );
  };

  handleToggleMenuSearchHints = () => {
    this.setState({
      isHiddenMenuSearchHints: !this.state.isHiddenMenuSearchHints
    });
  };

  handleToggleMenuSearchOptions = () => {
    this.setState({
      isHiddenMenuSearchOptions: !this.state.isHiddenMenuSearchOptions,
      isHiddenMenuSearchHints: true
    });
  };
}

MailboxHeader.propTypes = {
  multiselect: PropTypes.bool,
  onSearchChange: PropTypes.func,
  onSearchSelectThread: PropTypes.func,
  onSearchThreads: PropTypes.func,
  onToggleActivityPanel: PropTypes.func,
  setSearchParams: PropTypes.func,
  threadsSuggestions: PropTypes.object
};

export default MailboxHeader;
