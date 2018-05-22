import React, { Component } from 'react';
import PropTypes from 'prop-types';
import SearchHints from './SearchHints';
import SearchOptions from './SearchOptions';
import MenuHOC, { MenuType } from './MenuHOC';
import anime from 'animejs';
import './searchbox.css';

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
          placeholder="Search"
          value={this.props.searchParams.text}
        />
        <div className="header-search-toggle">
          <i
            className="icon-toogle-down"
            onClick={this.onToggleMenuSearchOptions}
          />
          <MenuSearchOptions
            allLabels={this.props.allLabels}
            arrowPosition={MenuType.TOP_RIGHT}
            getSearchParams={this.props.getSearchParams}
            isHidden={this.props.isHiddenMenuSearchOptions}
            onSearchThreads={this.props.onSearchThreads}
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

SearchBox.propTypes = {
  allLabels: PropTypes.array,
  getSearchParams: PropTypes.func,
  hints: PropTypes.object,
  isHiddenMenuSearchHints: PropTypes.bool,
  isHiddenMenuSearchOptions: PropTypes.bool,
  onSearchThreads: PropTypes.func,
  onSearchSelectThread: PropTypes.func,
  onToggleMenuSearchHints: PropTypes.func,
  onToggleMenuSearchOptions: PropTypes.func,
  onTriggerSearch: PropTypes.func,
  searchParams: PropTypes.object,
  threads: PropTypes.object
};

export default SearchBox;
