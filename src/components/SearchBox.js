import React, { Component } from 'react';
import ReactDOM from 'react-dom'
import anime from 'animejs'

let currentAnimation = null;

class SearchBox extends Component{

  constructor(){
    super();
    this.state = {
      extended: false
    }
  }

  componentWillReceiveProps(nextProps){
    if(this.props.hold && !nextProps.hold && document.activeElement !== this.input){
      return animateOut(ReactDOM.findDOMNode(this), () => {
        this.setState({extended: false});
      });
    }
  }

  render(){
    const {searchText, onSearchChange} = this.props;
    return (
      <div className="header-search" id="headerSearch">
        <i className="icon-search" />
        <input ref={r => this.input = r} onFocus={this.onExpandBox} onBlur={this.onShrinkBox} onChange={onSearchChange} value={searchText} />
        <i className="icon-toogle-down" onClick={this.onToggleSearchOptions} />
      </div>
    );
  };

  onToggleSearchOptions = () => {
    if(this.state.extended){
      clearCurrentAnimation();
      if(this.props.hold){
        this.input.focus();
      }
      return this.props.toggleSearchOptions();
    }

    return animateIn(ReactDOM.findDOMNode(this), () => {
      this.setState({extended: true}, () => {
        this.props.toggleSearchOptions()
      });
    });
  }

  onExpandBox = () => {
    return animateIn(ReactDOM.findDOMNode(this), () => {
      this.setState({extended: true});
    });
  }

  onShrinkBox = () => {
    if(this.props.hold){
      return;
    }
    return animateOut(ReactDOM.findDOMNode(this), () => {
      this.setState({extended: false});
    });
  }
}

const animateIn = (gridContainer, callback) => {
  clearCurrentAnimation();
  currentAnimation = anime.timeline()
    .add({
      targets: gridContainer,
      width: 400,
      duration: 500,
      elasticity: 0,
      complete: (anim) => {
        callback();
      }
    })
}

const animateOut = (gridContainer, callback) => {
  clearCurrentAnimation()
  currentAnimation = anime.timeline()
    .add({
      targets: gridContainer,
      width: 191,
      duration: 500,
      elasticity: 0,
      delay: 200,
      complete: (anim) => {
        callback();
      }
    })
}

const clearCurrentAnimation = () => {
  if (currentAnimation) currentAnimation.pause()
}

export default SearchBox;