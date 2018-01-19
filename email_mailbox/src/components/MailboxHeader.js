import React, { Component } from 'react';
import PropTypes from 'prop-types';
import HeaderThreadOptionsWrapper from './HeaderThreadOptionsWrapper';
import HeaderMain from './HeaderMain';
import './mailboxheader.css';

const ALL_MAIL = -1;
const MAX_SUGGESTIONS = 3;

class MailboxHeader extends Component {
  constructor() {
    super();
    this.state = {
      displaySearchHints: false,
      displaySearchOptions: false,
      searchParams: {
        text: '',
        mailbox: ALL_MAIL,
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
    const search = this.state.searchParams.text;
    const threads = this.state.displaySearchHints
      ? this.props.allThreads
          .filter(thread => {
            const mySubject = thread.get('subject');
            const myUsers = thread.get('participants');
            const myPreview = thread.get('preview');
            return (
              mySubject.includes(search) ||
              myUsers.includes(search) ||
              myPreview.includes(search)
            );
          })
          .slice(0, MAX_SUGGESTIONS)
      : null;
    return (
      <header className="mailbox-header">
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
            onSearchChange={this.onSearchChange}
            onTriggerSearch={this.onTriggerSearch}
            searchText={this.state.searchText}
            onSearchThreads={this.onSearchThreads}
          />
        )}
      </header>
    );
  }

  onSearchThreads = () => {
    this.setState(
      {
        displaySearchOptions: false
      },
      () => {
        this.props.onSearchThreads(this.state.searchParams);
      }
    );
  };

  onTriggerSearch = () => {
    if (this.state.displaySearchOptions || !this.state.searchParams.text) {
      return;
    }

    this.setState(
      {
        displaySearchHints: false
      },
      () => {
        this.props.onSearchThreads({
          text: this.state.searchParams.text,
          plain: true
        });
      }
    );
  };

  setSearchParam = (key, value) => {
    const displayHint =
      key === 'text'
        ? true
        : this.state.displaySearchOptions
          ? false
          : this.state.displaySearchHints;
    const searchParams = this.state.searchParams;
    searchParams[key] = value;
    this.setState({
      searchParams,
      displaySearchHints: displayHint
    });
  };

  toggleMoveMenu = () => {
    this.setState({
      displayMoveMenu: !this.state.displayMoveMenu
    });
  };

  toggleDotsMenu = () => {
    this.setState({
      displayDotsMenu: !this.state.displayDotsMenu
    });
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
  allThreads: PropTypes.object,
  multiselect: PropTypes.bool,
  onSearchThreads: PropTypes.func
};

export default MailboxHeader;
