import React, { Component } from 'react';
import HeaderActionTooltip from './HeaderActionTooltip';
import TooltipMenu from './TooltipMenu';
import CustomCheckbox from './CustomCheckbox';
import './selectheader.css';

class SelectHeader extends Component{
  render(){
    return (<header className='mailbox-header'>
      {this.renderSelectionInteraction()}
      {this.renderStandardOptions()}
      {this.renderMoreOptions()}
      <TooltipMenu title="Move to:" dismiss={this.onMoveClick} targetId="actionMove" display={this.props.displayMoveMenu}>
        <ul className='multiselect-list'>
          <li onClick={this.onActionMove}>Spam</li>
          <li onClick={this.onActionMove}>Trash</li>
        </ul>
      </TooltipMenu>
      <TooltipMenu title="Add Label:" dismiss={this.onTagsClick} targetId="actionTag" display={this.props.displayTagsMenu}>
        <ul className='multiselect-list'>
          {this.renderLabels()}
        </ul>
      </TooltipMenu>
      <TooltipMenu toLeft={true} dismiss={this.onDotsClick} targetId="actionDots" display={this.props.displayDotsMenu}>
        <ul className='multiselect-list'>
          <li onClick={this.markAsRead}>{this.props.markAsUnread ? 'Mark as Unread' : 'Mark as Read'}</li>
        </ul>
      </TooltipMenu>
    </header>);
  }

  renderSelectionInteraction = () => (<div>
    <div className='header-action'>
      <div data-tip data-for="actionDismiss" onClick={this.props.onMultiSelectDismiss}>
        <i className='icon-back'></i>
        <HeaderActionTooltip target="actionDismiss" tip='Dismiss'/>
      </div>
      <div 
        className={this.props.allSelected ? 'menu-select-all' : ''} 
        onClick={this.props.allSelected ? this.props.onDeselectThreads : this.props.onSelectThreads}>
        <i className={this.props.allSelected ? 'icon-check' : 'icon-box'}></i>
      </div>
    </div>
    <span>
      {this.props.threadsSelected.length} Selected
    </span>
  </div>)

  renderStandardOptions = () => (<div className='header-action'>
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
        : <HeaderActionTooltip target='actionTag' tip='Add Labels'/>
      }
    </div>
  </div>)

  renderMoreOptions = () => (<div className='header-action'>
    <div id='actionDots' onClick={this.onDotsClick}>
      <i className='icon-dots'></i>
    </div>
  </div>)

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

  onDotsClick = () => {
    this.props.toggleDotsMenu();
  }

  onTriggerLabel = (checked, label) => {
    if(checked){
      return this.props.onAddLabel(this.props.threadsSelected, label)
    }
    return this.props.onRemoveLabel(this.props.threadsSelected, label)
  }

  markAsRead = () => {
    this.props.onMarkAsRead(this.props.threadsSelected, !this.props.markAsUnread)
  }

  renderLabels = () => {
    return this.props.labels.reduce( (labelsView, label) => {
      labelsView.push(<CustomCheckbox key={label.id}
        onCheck={ (checked) => {
          this.onTriggerLabel(checked, label.id)
        }}
        label={label.text}
        status={label.checked}/>)
      return labelsView;
    }, [])
  }
};

export default SelectHeader;