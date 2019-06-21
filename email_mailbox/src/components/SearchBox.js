/* eslint react/no-deprecated: 0 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import SearchHints from './SearchHints';
import SearchOptions from './SearchOptions';
import MenuHOC, { MenuType } from './MenuHOC';
import anime from 'animejs';
import string from './../lang';
import './searchbox.scss';

const KEY_NEW_LINE = 13;
let currentAnimation = null;

const MenuSearchOptions = MenuHOC(SearchOptions);
const MenuSearchHints = MenuHOC(SearchHints);

class SearchBox extends Component {
  constructor() {
    super();
    this.state = {
      isInputBoxExtended: false
    };
  }

  componentWillReceiveProps(nextProps) {
    if (
      !this.props.isHiddenMenuSearchOptions &&
      nextProps.isHiddenMenuSearchOptions
    ) {
      return animateOut(this.node, () => {
        this.setState({ isInputBoxExtended: false });
      });
    }
  }

  render() {
    return (
      <div
        ref={node => (this.node = node)}
        className="header-search"
        id="headerSearch"
      >
        <i className="icon-search" />
        <input
          ref={r => (this.input = r)}
          onBlur={this.handleBlurInput}
          onChange={this.handleChangeInput}
          onFocus={this.handleFocusInput}
          onKeyPress={this.handleKeyPressInput}
          placeholder={string.header.search}
          value={this.props.searchParams.text}
          disabled={this.props.isLoadingThreads}
        />
        {this.renderSearchIcon()}
        <div className="header-search-toggle">
          <i
            className="icon-arrow-down"
            onClick={this.onToggleMenuSearchOptions}
          />
          <MenuSearchOptions
            allLabels={this.props.allLabels}
            arrowPosition={MenuType.TOP_RIGHT}
            getSearchParams={this.props.getSearchParams}
            isHidden={this.props.isHiddenMenuSearchOptions}
            onClickSearch={this.props.onClickSearch}
            onToggleMenu={this.props.onToggleMenuSearchOptions}
            menuPosition={{ right: '-32px', top: '32px' }}
            searchParams={this.props.searchParams}
          />
        </div>
        <MenuSearchHints
          isHidden={this.props.isHiddenMenuSearchHints}
          hints={this.props.hints}
          onClickSearchSuggestiontItem={this.handleSearchSuggestiontItem}
          onSearchSelectThread={this.props.onSearchSelectThread}
          onToggleMenu={this.props.onToggleMenuSearchHints}
          searchText={this.props.searchParams.text}
          threads={this.props.threads}
          menuPosition={{ top: '39px' }}
        />
      </div>
    );
  }

  handleBlurInput = () => {
    return animateOut(this.node, () => {
      this.setState({ isInputBoxExtended: false });
    });
  };

  handleChangeInput = ev => {
    const value = ev.target.value;
    this.props.getSearchParams('text', value);
  };

  handleFocusInput = () => {
    return animateIn(this.node, () => {
      this.setState({ isInputBoxExtended: true });
    });
  };

  handleKeyPressInput = ev => {
    if (ev.which === KEY_NEW_LINE || ev.keyCode === KEY_NEW_LINE) {
      ev.preventDefault();
      this.input.blur();
      this.props.onTriggerSearch();
    }
  };

  handleSearchSuggestiontItem = hint => {
    this.props.getSearchParams('text', hint);
    this.props.onTriggerSearch();
  };

  onToggleMenuSearchOptions = () => {
    if (this.state.isInputBoxExtended) {
      clearCurrentAnimation();
      if (!this.props.isHiddenMenuSearchOptions) {
        this.input.focus();
      }
      return this.props.onToggleMenuSearchOptions();
    }

    return animateIn(this.node, () => {
      this.setState({ isInputBoxExtended: true }, () => {
        this.props.onToggleMenuSearchOptions();
      });
    });
  };

  handleClearSearchInput = () => {
    this.props.onClearSearchInput();
    this.input.focus();
  };

  renderSearchIcon = () => {
    if (!this.props.searchParams.text) return null;
    if (this.props.isLoadingThreads) {
      return <SearchBoxLoading />;
    }
    return (
      <i className="icon-exit" onClick={() => this.handleClearSearchInput()} />
    );
  };
}

const animateIn = (gridContainer, callback) => {
  clearCurrentAnimation();
  currentAnimation = anime.timeline().add({
    targets: gridContainer,
    width: 395,
    duration: 500,
    elasticity: 0,
    complete: () => {
      callback();
    }
  });
};

const animateOut = (gridContainer, callback) => {
  clearCurrentAnimation();
  currentAnimation = anime.timeline().add({
    targets: gridContainer,
    width: 191,
    duration: 500,
    elasticity: 0,
    delay: 200,
    complete: () => {
      callback();
    }
  });
};

const clearCurrentAnimation = () => {
  if (currentAnimation) currentAnimation.pause();
};

const SearchBoxLoading = () => (
  <div className="loading-ring search-loading-ring">
    <div />
    <div />
    <div />
    <div />
  </div>
);

SearchBox.defaultProps = {
  isHiddenMenuSearchHints: true,
  isHiddenMenuSearchOptions: true,
  searchParams: {
    text: ''
  }
};

SearchBox.propTypes = {
  allLabels: PropTypes.array,
  getSearchParams: PropTypes.func,
  hints: PropTypes.object,
  isHiddenMenuSearchHints: PropTypes.bool,
  isHiddenMenuSearchOptions: PropTypes.bool,
  isLoadingThreads: PropTypes.bool,
  onClearSearchInput: PropTypes.func,
  onClickSearch: PropTypes.func,
  onSearchSelectThread: PropTypes.func,
  onToggleMenuSearchHints: PropTypes.func,
  onToggleMenuSearchOptions: PropTypes.func,
  onTriggerSearch: PropTypes.func,
  searchParams: PropTypes.object,
  threads: PropTypes.object
};

export default SearchBox;
