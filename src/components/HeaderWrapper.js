import React, { Component } from 'react';
import SelectHeader from './SelectHeader';
import Header from './Header';

class HeaderWrapper extends Component {
  constructor() {
    super();
    this.state = {
      search: '',
      displayMoveMenu: false,
      displayDotsMenu: false,
      displaySearchHints: false,
      displaySearchOptions: false
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
        displaySearchHints={this.state.displaySearchHints}
        displaySearchOptions={this.state.displaySearchOptions}
        toggleSearchHints={this.toggleSearchHints}
        toggleSearchOptions={this.toggleSearchOptions}
        onSearchChange={this.onSearchChange}
        searchText={this.state.searchText}
        {...this.props}
      />
    );
  }

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
      displaySearchHints: this.state.displaySearchOptions ? false : !this.state.displaySearchHints,
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

  onSearchChange = (ev) => {
    const search = ev.target.value;
    this.setState({
      search,
      displaySearchHints: this.state.displaySearchOptions ? false : true
    })
  }
}

export default HeaderWrapper;
