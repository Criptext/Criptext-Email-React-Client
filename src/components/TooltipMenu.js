import React, { Component } from 'react';
import './tooltipmenu.css'

class TooltipMenu extends Component{
  constructor(){
    super();
    this.state = {
      top: 0,
      left: 0,
      display: 'none'
    }
  }

  render(){
    return (<div 
      className="tooltip-menu-container" 
      style={{display: this.props.display ? 'block' : 'none'}}>
      <div
        ref={ r => {this.myself = r} }
        style={this.state}
        className={'tooltip-menu-wrapper ' + (this.props.class || '')}>
        { this.props.title
          ? <h3>{this.props.title}</h3>
          : null
        }
        {this.props.children}
        <div className={'tooltip-menu-tip ' + (this.props.toLeft ? 'tip-to-left' : 'tip-to-right')}></div>
      </div>
      <div onClick={this.props.dismiss} className='tooltip-menu-overlay'>
      </div>
    </div>);
  }

  componentDidUpdate(){
    if(!this.props.display){
      return null;
    }

    const targetDiv = document.getElementById(this.props.targetId);

    if(!targetDiv || !this.myself){
      return null;
    }
    const top = targetDiv.offsetTop - targetDiv.parentElement.scrollTop + targetDiv.clientHeight + 10;
    const left = this.props.toLeft 
      ? (targetDiv.offsetLeft - targetDiv.parentElement.scrollLeft - this.myself.clientWidth + targetDiv.clientWidth)
      : (targetDiv.offsetLeft - targetDiv.parentElement.scrollLeft);

    if(top !== this.state.top || left !== this.state.left){
      this.setState({
        top,
        left,
        display: 'block'
      })
    }
  }

}

export default TooltipMenu;