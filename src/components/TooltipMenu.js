import React, { Component } from 'react';
import './tooltipmenu.css'

class TooltipMenu extends Component{

  render(){
    return (<div 
      className="tooltip-menu-container" 
      style={{display: this.props.display ? 'block' : 'none'}}>
      <div
      style={this.getPosition()}
        className='tooltip-menu-wrapper'>
        <h3>{this.props.title}</h3>
        {this.props.children}
        <div className='tooltip-menu-tip'></div>
      </div>
      <div onClick={this.props.dismiss} className='tooltip-menu-overlay'>
      </div>
    </div>);
  }

  getPosition = () => {
    if(!this.props.display){
      return null;
    }

    const targetDiv = document.getElementById(this.props.targetId);

    const top = targetDiv.offsetTop - targetDiv.parentElement.scrollTop + targetDiv.clientHeight + 10;
    const left = targetDiv.offsetLeft - targetDiv.parentElement.scrollLeft;

    return {
      top,
      left
    }
  }

}

export default TooltipMenu;