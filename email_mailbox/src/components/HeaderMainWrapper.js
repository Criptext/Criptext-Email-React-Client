import React, { Component } from 'react';
import PropTypes from 'prop-types';
import HeaderMain from './HeaderMain';
import { LabelType } from '../utils/electronInterface';

class HeaderMainWrapper extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isHiddenMenuSearchHints: true,
      isHiddenMenuSearchOptions: true,
      isLoadingSearch: false,
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
        isLoadingSearch={this.state.isLoadingSearch}
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

  componentDidMount() {
    if (!this.props.sectionSelected) return;
    const text = this.props.sectionSelected.params.searchParams
      ? this.props.sectionSelected.params.searchParams.text
      : false;
    const stateText = this.state.searchParams.text;
    if (text && !stateText) {
      this.setState(state => {
        const searchParams = state.searchParams;
        return { searchParams: { ...searchParams, text } };
      });
    }
  }

  componentDidUpdate(prevProps) {
    const nextSectionIsSettings =
      prevProps.sectionSelected && !this.props.sectionSelected;
    if (nextSectionIsSettings) {
      return this.handleClearSearchInput();
    }
    if (!prevProps.sectionSelected) return;
    const prevMailboxId = prevProps.sectionSelected.params.mailboxSelected.id;
    const nextMailboxId = this.props.sectionSelected.params.mailboxSelected.id;
    const prevMailboxIsSearch = prevMailboxId === LabelType.search.id;
    const nextMailboxIsDifferent = prevMailboxId !== nextMailboxId;
    if (prevMailboxIsSearch && nextMailboxIsDifferent) {
      return this.handleClearSearchInput();
    }
    const { isLoadingThreads } = this.props;
    const alreadyIsLoading = this.state.isLoadingSearch;
    if (prevMailboxIsSearch && !isLoadingThreads && alreadyIsLoading) {
      return this.setState({ isLoadingSearch: false });
    }
  }

  handleClearSearchInput = () => {
    const newState = {
      isLoadingSearch: false,
      searchParams: {
        text: '',
        from: '',
        to: '',
        subject: '',
        hasAttachments: false
      }
    };
    if (!this.state.isHiddenMenuSearchOptions) {
      newState['isHiddenMenuSearchOptions'] = true;
    }
    this.setState(newState, this.props.onClearSearchResults);
  };

  handleClickSearch = () => {
    this.setState(
      {
        isHiddenMenuSearchOptions: true,
        isLoadingSearch: true
      },
      () => {
        this.props.onSearchThreads(this.state.searchParams);
      }
    );
  };

  handleGetSearchParams = (key, value) => {
    const isHiddenMenuSearchHints =
      key === 'text' ? !this.state.isHiddenMenuSearchOptions : true;
    const searchParams = { ...this.state.searchParams, [key]: value };
    if (!value) {
      return this.setState({
        searchParams,
        isHiddenMenuSearchHints
      });
    }

    if (this.lastSearchChange) clearTimeout(this.lastSearchChange);
    this.lastSearchChange = setTimeout(() => {
      if (this.state.searchParams[key] !== value) return;
      if (!isHiddenMenuSearchHints && key === 'text') {
        this.props.onSearchChange(value);
      }
    }, 500);
    this.setState({
      searchParams,
      isHiddenMenuSearchHints
    });
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
      return this.setState(
        {
          isHiddenMenuSearchHints: true,
          isLoadingSearch: false
        },
        () => {
          if (!this.state.searchParams.text) this.props.onGoToDefaultInbox();
        }
      );
    }

    this.setState(
      {
        isHiddenMenuSearchHints: true,
        isLoadingSearch: true
      },
      () => {
        this.props.onSearchThreads(this.state.searchParams);
      }
    );
  };
}

HeaderMainWrapper.propTypes = {
  isLoadingThreads: PropTypes.bool,
  onClearSearchResults: PropTypes.func,
  onGoToDefaultInbox: PropTypes.func,
  onSearchChange: PropTypes.func,
  onSearchSelectThread: PropTypes.func,
  onSearchThreads: PropTypes.func,
  searchParams: PropTypes.object,
  sectionSelected: PropTypes.object
};

export default HeaderMainWrapper;
