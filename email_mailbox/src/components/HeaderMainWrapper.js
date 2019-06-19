import React, { Component } from 'react';
import PropTypes from 'prop-types';
import HeaderMain from './HeaderMain';

class HeaderMainWrapper extends Component {
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

  render() {
    return (
      <HeaderMain
        {...this.props}
        isHiddenMenuSearchHints={this.state.isHiddenMenuSearchHints}
        isHiddenMenuSearchOptions={this.state.isHiddenMenuSearchOptions}
        onSearchSelectThread={this.handleSearchSelectThread}
        onToggleMenuSearchHints={this.handleToggleMenuSearchHints}
        onToggleMenuSearchOptions={this.handleToggleMenuSearchOptions}
        onTriggerSearch={this.handleTriggerSearch}
        onClickSearch={this.handleClickSearch}
        searchParams={this.state.searchParams}
        getSearchParams={this.handleGetSearchParams}
        onClearSearchInput={this.handleClearSearchInput}
      />
    );
  }

  handleClearSearchInput = () => {
    const newState = {
      searchParams: {
        text: '',
        from: '',
        to: '',
        subject: '',
        hasAttachments: false
      }      
    };
    if (!this.state.isHiddenMenuSearchOptions) {
      newState["isHiddenMenuSearchOptions"] = true
    }
    this.setState(newState);
  };

  handleClickSearch = () => {
    this.setState({ isHiddenMenuSearchOptions: true }, () => {
      this.props.onSearchThreads(this.state.searchParams);
    });
  };

  handleGetSearchParams = (key, value) => {
    const isHiddenMenuSearchHints =
      key === 'text' ? !this.state.isHiddenMenuSearchOptions : true;
    const searchParams = { ...this.state.searchParams, [key]: value };
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

  handleSearchSelectThread = threadId => {
    this.props.onSearchSelectThread(threadId, this.state.searchParams);
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
        this.props.onSearchThreads(this.state.searchParams);
      }
    );
  };
}

HeaderMainWrapper.propTypes = {
  onSearchChange: PropTypes.func,
  onSearchSelectThread: PropTypes.func,
  onSearchThreads: PropTypes.func,
  searchParams: PropTypes.object
};

export default HeaderMainWrapper;
