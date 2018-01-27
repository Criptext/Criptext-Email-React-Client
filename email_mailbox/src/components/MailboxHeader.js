import React, { Component } from 'react';
import PropTypes from 'prop-types';
import HeaderThreadOptionsWrapper from './HeaderThreadOptionsWrapper';
import HeaderMain from './HeaderMain';
import './mailboxheader.css';

const ALL_MAIL = -1;

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
    const threads = this.state.displaySearchHints
      ? this.props.threadsSuggestions
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
            onTriggerSearch={this.onTriggerSearch}
            searchText={this.state.searchParams.text}
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
      return this.setState({
        displaySearchHints: false
      });
    }

    this.setState(
      {
        displaySearchHints: false
      },
      () => {
        this.props.setSearchParams(this.state.searchParams)
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
        ? this.state.displaySearchOptions
          ? false
          : true
        : false;
    const searchParams = this.state.searchParams;
    searchParams[key] = value;
    this.setState({
      searchParams,
      displaySearchHints: displayHint
    }, () => {
      if(displayHint && key === 'text'){
        this.props.onSearchChange(value);
      }
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
  threadsSuggestions: PropTypes.array,
  multiselect: PropTypes.bool,
  onSearchThreads: PropTypes.func
};

export default MailboxHeader;
