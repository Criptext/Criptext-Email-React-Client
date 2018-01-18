import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import anime from 'animejs';

const KEY_NEW_LINE = 13;
let currentAnimation = null;

class SearchBox extends Component {
  constructor() {
    super();
    this.state = {
      extended: false
    };
  }

  componentWillReceiveProps(nextProps) {
    if (
      this.props.hold &&
      !nextProps.hold &&
      document.activeElement !== this.input
    ) {
      return animateOut(ReactDOM.findDOMNode(this), () => {
        this.setState({ extended: false });
      });
    }
  }

  render() {
    const { searchText } = this.props;
    return (
      <div className="header-search" id="headerSearch">
        <i className="icon-search" />
        <input
          ref={r => (this.input = r)}
          onFocus={this.onExpandBox}
          onChange={this.onChange}
          onBlur={this.onShrinkBox}
          value={searchText}
          onKeyPress={this.onKeyPress}
        />
        <i className="icon-toogle-down" onClick={this.onToggleSearchOptions} />
      </div>
    );
  }

  onChange = ev => {
    const value = ev.target.value;
    this.props.setSearchParam('text', value);
  };

  onKeyPress = ev => {
    if (ev.which === KEY_NEW_LINE || ev.keyCode === KEY_NEW_LINE) {
      ev.preventDefault();
      this.input.blur();
      this.props.onTriggerSearch();
    }
  };

  onToggleSearchOptions = () => {
    if (this.state.extended) {
      clearCurrentAnimation();
      if (this.props.hold) {
        this.input.focus();
      }
      return this.props.toggleSearchOptions();
    }

    return animateIn(ReactDOM.findDOMNode(this), () => {
      this.setState({ extended: true }, () => {
        this.props.toggleSearchOptions();
      });
    });
  };

  onExpandBox = () => {
    return animateIn(ReactDOM.findDOMNode(this), () => {
      this.setState({ extended: true });
    });
  };

  onShrinkBox = () => {
    if (this.props.hold) {
      return;
    }
    return animateOut(ReactDOM.findDOMNode(this), () => {
      this.setState({ extended: false });
    });
  };
}

const animateIn = (gridContainer, callback) => {
  clearCurrentAnimation();
  currentAnimation = anime.timeline().add({
    targets: gridContainer,
    width: 400,
    duration: 500,
    elasticity: 0,
    complete: anim => {
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
    complete: anim => {
      callback();
    }
  });
};

const clearCurrentAnimation = () => {
  if (currentAnimation) currentAnimation.pause();
};

export default SearchBox;
