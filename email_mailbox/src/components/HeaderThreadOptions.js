import React, { Component } from 'react';
import PropTypes from 'prop-types';
import StandardOptions from './StandardOptions';
import ButtonCircle from './ButtonCircle';
import TooltipMenu from './TooltipMenu';
import CustomCheckbox, { CustomCheckboxStatus } from './CustomCheckbox';
import './headerthreadoptions.css';

class HeaderThreadOptions extends Component {
  render() {
    const {
      displayMoveMenu,
      displayTagsMenu,
      displayDotsMenu,
      markAsUnread
    } = this.props;
    return (
      <div className="header-threadoptions">
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
            <li onClick={this.onActionMove}>
              <span>Spam</span>
            </li>
            <li onClick={this.onActionMove}>
              <span>Trash</span>
            </li>
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
              <span>{markAsUnread ? 'Mark as Unread' : 'Mark as Read'}</span>
            </li>
            <li>
              <span>Mark as Important</span>
            </li>
          </ul>
        </TooltipMenu>
      </div>
    );
  }

  renderSelectionInteraction = () => (
    <div className="header-action">
      <ButtonCircle
        onClick={this.props.onBackOption}
        tip="Dismiss"
        enableTip={true}
        icon="icon-back"
        targetName="actionDismiss"
      />
      {this.props.showSelectAllOption ? (
        <div className="button-string-container">
          <ButtonCircle
            onClick={
              this.props.allSelected
                ? this.props.onDeselectThreads
                : this.props.onSelectThreads
            }
            enableTip={false}
            myClass={this.props.allSelected ? 'menu-select-all' : ''}
            icon={this.props.allSelected ? 'icon-check' : 'icon-box'}
          />
          <span>{this.props.threadsSelected.length} Selected</span>
        </div>
      ) : null}
    </div>
  );

  renderMoreOptions = () => (
    <div className="header-action">
      <ButtonCircle
        onClick={this.onDotsClick}
        targetName="actionDots"
        icon="icon-dots"
        enableTip={false}
      />
    </div>
  );

  onActionMove = () => {
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
    if (CustomCheckboxStatus.toBoolean(checked)) {
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
    return this.props.labels
      .filter(label => label.id > 7)
      .map((label, index) => (
        <li key={index}>
          <CustomCheckbox
            onCheck={checked => {
              this.onTriggerLabel(checked, label.id);
            }}
            label={label.text}
            status={label.checked}
          />
        </li>
      ));
  };
}

HeaderThreadOptions.propTypes = {
  allSelected: PropTypes.bool,
  displayMoveMenu: PropTypes.bool,
  displayTagsMenu: PropTypes.bool,
  displayDotsMenu: PropTypes.bool,
  labels: PropTypes.array,
  markAsUnread: PropTypes.bool,
  onAddLabel: PropTypes.func,
  onBackOption: PropTypes.func,
  onMarkAsRead: PropTypes.func,
  onMoveThreads: PropTypes.func,
  onDeselectThreads: PropTypes.func,
  onRemoveLabel: PropTypes.func,
  onSelectThreads: PropTypes.func,
  showSelectAllOption: PropTypes.bool,
  threadsSelected: PropTypes.array,
  toggleDotsMenu: PropTypes.func,
  toggleMoveMenu: PropTypes.func,
  toggleTagsMenu: PropTypes.func
};

export default HeaderThreadOptions;
