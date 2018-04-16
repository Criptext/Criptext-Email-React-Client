import React, { Component } from 'react';
import PropTypes from 'prop-types';
import HeaderThreadOptionsWrapper from './HeaderThreadOptionsWrapper';
import HeaderMain from './HeaderMain';
import ActivityPanelShortCut from './ActivityPanelShortCut';
import './mailboxheader.css';

class MailboxHeader extends Component {
  constructor() {
    super();
    this.state = {
      displaySearchHints: false,
      displaySearchOptions: false,
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
        displaySearchHints: false,
        displaySearchOptions: false
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
              setSearchParam={this.setSearchParam}
              searchParams={this.state.searchParams}
              displaySearchHints={this.state.displaySearchHints}
              displaySearchOptions={this.state.displaySearchOptions}
              toggleSearchHints={this.toggleSearchHints}
              toggleSearchOptions={this.toggleSearchOptions}
              onTriggerSearch={this.onTriggerSearch}
              searchText={this.state.searchParams.text}
              onSearchThreads={this.onSearchThreads}
              onSearchSelectThread={this.props.onSearchSelectThread}
            />
          )}
        </div>
        {!this.props.isOpenActivityPanel ? (
          <ActivityPanelShortCut onClick={this.props.onToggleActivityPanel} />
        ) : null}
      </header>
    );
  }

  onSearchThreads = () => {
    this.setState(
      {
        displaySearchOptions: false
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

  onTriggerSearch = () => {
    if (this.state.displaySearchOptions || !this.state.searchParams.text) {
      return this.setState({
        displaySearchHints: false
      });
    }

    this.setState(
      {
        displaySearchHints: false
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

  setSearchParam = (key, value) => {
    const displayHint =
      key === 'text' ? (this.state.displaySearchOptions ? false : true) : false;
    const searchParams = this.state.searchParams;
    searchParams[key] = value;
    this.setState(
      {
        searchParams,
        displaySearchHints: displayHint
      },
      () => {
        if (displayHint && key === 'text') {
          this.props.onSearchChange(value);
        }
      }
    );
  };

  toggleSearchHints = () => {
    this.setState({
      displaySearchHints: this.state.displaySearchOptions
        ? false
        : !this.state.displaySearchHints
    });
  };

  toggleSearchOptions = () => {
    this.setState({
      displaySearchOptions: !this.state.displaySearchOptions,
      displaySearchHints: false
    });
  };
}

MailboxHeader.propTypes = {
  isOpenActivityPanel: PropTypes.bool,
  multiselect: PropTypes.bool,
  onSearchChange: PropTypes.func,
  onSearchSelectThread: PropTypes.func,
  onSearchThreads: PropTypes.func,
  onToggleActivityPanel: PropTypes.func,
  setSearchParams: PropTypes.func,
  threadsSuggestions: PropTypes.object
};

export default MailboxHeader;
