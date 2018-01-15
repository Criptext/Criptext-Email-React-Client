import React, { Component } from 'react';
import HeaderActionTooltip from './HeaderActionTooltip';
import StandardOptions from './StandardOptions';
import TooltipMenu from './TooltipMenu';
import CustomCheckbox from './CustomCheckbox';
import './selectheader.css';

class SelectHeader extends Component {
  render() {
    const {
      displayMoveMenu,
      displayTagsMenu,
      displayDotsMenu,
      markAsUnread
    } = this.props;
    return (
      <header className="mailbox-header">
        {this.renderSelectionInteraction()}
        <StandardOptions
          onActionMove={this.onActionMove}
          onMoveClick={this.onMoveClick}
          onTagsClick={this.onTagsClick}
          displayMoveMenu={displayMoveMenu}
          displayTagsMenu={displayTagsMenu}
        />
        {this.renderMoreOptions()}
        <TooltipMenu
          title="Move to:"
          dismiss={this.onMoveClick}
          targetId="actionMove"
          display={displayMoveMenu}
        >
          <ul className="multiselect-list">
            <li onClick={this.onActionMove}>Spam</li>
            <li onClick={this.onActionMove}>Trash</li>
          </ul>
        </TooltipMenu>
        <TooltipMenu
          title="Add Label:"
          dismiss={this.onTagsClick}
          targetId="actionTag"
          display={displayTagsMenu}
        >
          <ul className="multiselect-list">{this.renderLabels()}</ul>
        </TooltipMenu>
        <TooltipMenu
          toLeft={true}
          dismiss={this.onDotsClick}
          targetId="actionDots"
          display={displayDotsMenu}
        >
          <ul className="multiselect-list">
            <li onClick={this.markAsRead}>
              {markAsUnread ? 'Mark as Unread' : 'Mark as Read'}
            </li>
          </ul>
        </TooltipMenu>
      </header>
    );
  }

  renderSelectionInteraction = () => (
    <div>
      <div className="header-action">
        <div
          data-tip
          data-for="actionDismiss"
          onClick={this.props.onMultiSelectDismiss}
        >
          <i className="icon-back" />
          <HeaderActionTooltip target="actionDismiss" tip="Dismiss" />
        </div>
        <div
          className={this.props.allSelected ? 'menu-select-all' : ''}
          onClick={
            this.props.allSelected
              ? this.props.onDeselectThreads
              : this.props.onSelectThreads
          }
        >
          <i className={this.props.allSelected ? 'icon-check' : 'icon-box'} />
        </div>
      </div>
      <span>{this.props.threadsSelected.length} Selected</span>
    </div>
  );

  renderMoreOptions = () => (
    <div className="header-action">
      <div id="actionDots" onClick={this.onDotsClick}>
        <i className="icon-dots" />
      </div>
    </div>
  );

  onActionMove = ev => {
    if (this.props.threadsSelected.length === 0) {
      return;
    }
    this.props.onMoveThreads(this.props.threadsSelected);
  };

  onMoveClick = () => {
    this.props.toggleMoveMenu();
  };

  onTagsClick = () => {
    this.props.toggleTagsMenu();
  };

  onDotsClick = () => {
    this.props.toggleDotsMenu();
  };

  onTriggerLabel = (checked, label) => {
    if (checked) {
      return this.props.onAddLabel(this.props.threadsSelected, label);
    }
    return this.props.onRemoveLabel(this.props.threadsSelected, label);
  };

  markAsRead = () => {
    this.props.onMarkAsRead(
      this.props.threadsSelected,
      !this.props.markAsUnread
    );
  };

  renderLabels = () => {
    return this.props.labels.reduce((labelsView, label) => {
      labelsView.push(
        <CustomCheckbox
          key={label.id}
          onCheck={checked => {
            this.onTriggerLabel(checked, label.id);
          }}
          label={label.text}
          status={label.checked}
        />
      );
      return labelsView;
    }, []);
  };
}

export default SelectHeader;
