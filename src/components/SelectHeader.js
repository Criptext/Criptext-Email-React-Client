import React, { Component } from 'react';
import HeaderActionTooltip from './HeaderActionTooltip';
import TooltipMenu from './TooltipMenu'

class SelectHeader extends Component{
  render(){
    return (<header className='mailbox-header'>
      <div>
        <div className='header-action'>
          <div data-tip data-for="actionDismiss" onClick={this.props.onDeselectThreads}>
            <i className='icon-back'></i>
            <HeaderActionTooltip target="actionDismiss" tip='Dismiss'/>
          </div>
          <div onClick={this.props.onSelectThreads}>
            <i className={this.props.allSelected ? 'icon-check' : 'icon-box'}></i>
          </div>
        </div>
        <div>
          {this.props.threadsSelected.length} Selected
        </div>
      </div>
      <div className='header-action'>
        <div onClick={this.onActionMove} data-tip data-for="actionArchive">
          <i className='icon-archive'></i>
          <HeaderActionTooltip target="actionArchive" tip='Archive'/>
        </div>
        <div onClick={this.onActionMove} data-tip data-for="actionSpam">
          <i className='icon-not'></i>
          <HeaderActionTooltip target='actionSpam' tip='Spam'/>
        </div>
        <div onClick={this.onActionMove} data-tip data-for="actionTrash">
          <i className='icon-trash'></i>
          <HeaderActionTooltip target='actionTrash' tip='Trash'/>
        </div>
        <div id="actionMove" onClick={this.onMoveClick} data-tip data-for="actionMove">
          <i className='icon-file'></i>
          {this.props.displayMoveMenu
            ? null
            : <HeaderActionTooltip target='actionMove' tip='Move to'/>
          }
        </div>
        <div id="actionTag" onClick={this.onTagsClick} data-tip data-for="actionTag">
          <i className='icon-tag'></i>
          {this.props.displayTagsMenu
            ? null
            : <HeaderActionTooltip target='actionTag' tip='Add a Tag'/>
          }
        </div>
      </div>
      <div className='header-action'>
        <div>
          <i className='icon-dots'></i>
        </div>
      </div>
      <TooltipMenu title="Move to:" dismiss={this.onMoveClick} targetId="actionMove" display={this.props.displayMoveMenu}>
        <ul>
          <li onClick={this.onActionMove}>Spam</li>
          <li onClick={this.onActionMove}>Trash</li>
        </ul>
      </TooltipMenu>
      <TooltipMenu title="Add Label:" dismiss={this.onTagsClick} targetId="actionTag" display={this.props.displayTagsMenu}>
        <ul>
          <li><label><input type="checkbox"/>Spam</label></li>
          <li><label><input type="checkbox"/>Trash</label></li>
        </ul>
      </TooltipMenu>
    </header>);
  }

  onActionMove = (ev) => {
    if(this.props.threadsSelected.length === 0){
      return;
    }
    this.props.onMoveThreads(this.props.threadsSelected)
  }

  onMoveClick = () => {
    this.props.toggleMoveMenu();
  }

  onTagsClick = () => {
    this.props.toggleTagsMenu();
  }
};

export default SelectHeader;