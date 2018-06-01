import React, { Component } from 'react';
import PropTypes from 'prop-types';
import StandardOptions from './StandardOptions';
import ButtonCircle from './ButtonCircle';
import TooltipMenu from './TooltipMenu';
import CustomCheckbox from './CustomCheckbox';
import './headerthreadoptions.css';

class HeaderThreadOptions extends Component {
  render() {
    const {
      displayFolderMenu,
      displayTagsMenu,
      displayDotsMenu,
      isVisibleArchiveButton,
      isVisibleSpamButton,
      isVisibleTrashButton,
      markAsUnread,
      onClickMoveToArchive,
      onClickMoveToSpam,
      onClickMoveToTrash,
      onToggleFolderMenu,
      onToggleTagsMenu
    } = this.props;
    return (
      <div className="header-threadoptions">
        {this.renderSelectionInteraction()}
        <StandardOptions
          displayFolderMenu={displayFolderMenu}
          displayTagsMenu={displayTagsMenu}
          isVisibleArchiveButton={isVisibleArchiveButton}
          isVisibleSpamButton={isVisibleSpamButton}
          isVisibleTrashButton={isVisibleTrashButton}
          onClickMoveToArchive={onClickMoveToArchive}
          onClickMoveToSpam={onClickMoveToSpam}
          onClickMoveToTrash={onClickMoveToTrash}
          onToggleFolderMenu={onToggleFolderMenu}
          onToggleTagsMenu={onToggleTagsMenu}
        />
        {this.renderMoreOptions()}
        <TooltipMenu
          title="Move to:"
          dismiss={onToggleFolderMenu}
          targetId="actionMove"
          display={displayFolderMenu}
        >
          <ul className="multiselect-list">
            <li onClick={onClickMoveToSpam}>
              <span>Spam</span>
            </li>
            <li onClick={onClickMoveToTrash}>
              <span>Trash</span>
            </li>
          </ul>
        </TooltipMenu>
        <TooltipMenu
          title="Add Label:"
          dismiss={onToggleTagsMenu}
          targetId="actionTag"
          display={displayTagsMenu}
        >
          <ul className="multiselect-list">{this.renderLabels()}</ul>
        </TooltipMenu>
        <TooltipMenu
          toLeft={true}
          dismiss={this.props.onToggleDotsMenu}
          targetId="actionDots"
          display={displayDotsMenu}
        >
          <ul className="multiselect-list">
            <li onClick={() => this.props.onClickMarkAsRead()}>
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
        onClick={() => this.props.onBackOption()}
        tip="Dismiss"
        enableTip={true}
        icon="icon-back"
        targetName="actionDismiss"
      />
      {this.props.itemsChecked ? (
        <div className="button-string-container">
          <ButtonCircle
            onClick={() =>
              this.props.onCheckAllThreadItems(
                this.props.allSelected,
                this.props.threadIds
              )
            }
            enableTip={false}
            myClass={this.props.allSelected ? 'menu-select-all' : ''}
            icon={this.props.allSelected ? 'icon-check' : 'icon-box'}
          />
          <span>{this.props.itemsChecked.size} Selected</span>
        </div>
      ) : null}
    </div>
  );

  renderMoreOptions = () => (
    <div className="header-action">
      <ButtonCircle
        onClick={this.props.onToggleDotsMenu}
        targetName="actionDots"
        icon="icon-dots"
        enableTip={false}
      />
    </div>
  );

  renderLabels = () => {
    return this.props.labels.map((label, index) => (
      <li key={index}>
        <CustomCheckbox
          onCheck={checked => {
            this.props.onClickLabelCheckbox(checked, label.id);
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
  displayFolderMenu: PropTypes.bool,
  displayTagsMenu: PropTypes.bool,
  displayDotsMenu: PropTypes.bool,
  isVisibleArchiveButton: PropTypes.bool,
  isVisibleSpamButton: PropTypes.bool,
  isVisibleTrashButton: PropTypes.bool,
  itemsChecked: PropTypes.object,
  labels: PropTypes.array,
  markAsUnread: PropTypes.bool,
  onBackOption: PropTypes.func,
  onCheckAllThreadItems: PropTypes.func,
  onClickLabelCheckbox: PropTypes.func,
  onClickMoveToArchive: PropTypes.func,
  onClickMoveToSpam: PropTypes.func,
  onClickMoveToTrash: PropTypes.func,
  onClickMarkAsRead: PropTypes.func,
  onToggleDotsMenu: PropTypes.func,
  onToggleFolderMenu: PropTypes.func,
  onToggleTagsMenu: PropTypes.func,
  threadIds: PropTypes.object
};

export default HeaderThreadOptions;
