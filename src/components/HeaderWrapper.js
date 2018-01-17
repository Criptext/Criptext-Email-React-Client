import React, { Component } from 'react';
import SelectHeader from './SelectHeader';
import Header from './Header';

class HeaderWrapper extends Component {
  constructor() {
    super();
    this.state = {
      displayMoveMenu: false,
      displayDotsMenu: false,
      displaySearchHints: false,
      displaySearchOptions: false,
      searchParams: {
        text: '',
        mailbox: '-1',
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
        displayMoveMenu: false,
        displayDotsMenu: false,
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
          .slice(0, 3)
      : null;
    return this.props.multiselect ? (
      <SelectHeader
        displayMoveMenu={this.state.displayMoveMenu}
        displayDotsMenu={this.state.displayDotsMenu}
        toggleMoveMenu={this.toggleMoveMenu}
        toggleDotsMenu={this.toggleDotsMenu}
        onMarkAsRead={this.onMarkAsRead}
        {...this.props}
      />
    ) : (
      <Header
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

  onMarkAsRead = (threadsIds, read) => {
    this.setState(
      {
        displayDotsMenu: false
      },
      () => {
        this.props.onMarkRead(threadsIds, read);
      }
    );
  };
}

export default HeaderWrapper;
