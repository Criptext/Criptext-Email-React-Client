import React, { Component } from 'react';
import PropTypes from 'prop-types';
import SettingLabels from './SettingLabels';

class SettingLabelsWrapper extends Component {
  constructor(props) {
    super(props);
    this.state = {
      popupType: PopupTypes.NONE,
      popupState: null,
      isAddinglabel: false,
      labelToAdd: ''
    };
  }

  render() {
    return (
      <SettingLabels
        {...this.props}
        isAddinglabel={this.state.isAddinglabel}
        labelToAdd={this.state.labelToAdd}
        onToggleAddLabelButtonClicked={this.handleToggleAddLabelButtonClicked}
        onAddLabelInputChanged={this.handleAddLabelInputChanged}
        onAddLabelInputKeyPressed={this.handleAddLabelInputKeyPressed}
        onClickChangeLabelVisibility={this.handleClickChangeLabelVisibility}
        onClickRemoveLabel={this.handleClickRemoveLabel}
        onClickCancelRemoveLabel={this.handleDismissPopup}
        onClickConfirmRemoveLabel={this.handleRemoveLabel}
        onClickEditLabel={this.handleClickEditLabel}
        onClickCancelEditLabel={this.handleDismissPopup}
        onClickConfirmEditLabel={this.handleEditLabel}
        onChangeEditLabel={this.handleChangeEditLabel}
        popupType={this.state.popupType}
        popupState={this.state.popupState}
      />
    );
  }

  handleToggleAddLabelButtonClicked = () => {
    this.setState({ isAddinglabel: !this.state.isAddinglabel });
  };

  handleAddLabelInputChanged = e => {
    this.setState({ labelToAdd: e.target.value });
  };

  handleAddLabelInputKeyPressed = async e => {
    if (e.key === 'Enter' && e.target.value.trim() !== '') {
      await this.props.onAddLabel(e.target.value.trim());
      this.setState({
        labelToAdd: '',
        isAddinglabel: false
      });
    }
  };

  handleClickRemoveLabel = customLabel => {
    this.setState({
      popupType: PopupTypes.REMOVE,
      popupState: {
        labelToDelete: customLabel
      }
    });
  };

  handleRemoveLabel = () => {
    const { id, uuid } = this.state.popupState.labelToDelete;
    if (!id || !uuid) {
      return;
    }
    this.setState(
      {
        popupType: PopupTypes.NONE,
        popupState: null
      },
      () => {
        this.props.onRemoveLabel(id, uuid);
      }
    );
  };

  handleDismissPopup = () => {
    this.setState({
      popupType: PopupTypes.NONE,
      popupState: null
    });
  };

  handleClickChangeLabelVisibility = (nextCheckedValue, id) => {
    const visible = nextCheckedValue === 'all';
    this.props.onUpdateLabel({ id, visible });
  };

  handleClickEditLabel = customLabel => {
    this.setState({
      popupType: PopupTypes.EDIT,
      popupState: {
        newLabel: customLabel.text,
        labelToEdit: customLabel
      }
    });
  };

  handleEditLabel = () => {
    const { id, uuid, text } = this.state.popupState.labelToEdit;
    const labelName = this.state.popupState.newLabel;
    if (!id || !uuid || labelName === text) {
      return;
    }
    this.setState(
      {
        popupType: PopupTypes.NONE,
        popupState: null
      },
      () => {
        this.props.onUpdateLabel({
          id,
          uuid,
          text: labelName
        });
      }
    );
  };

  handleChangeEditLabel = ev => {
    const newLabel = ev.target.value;
    this.setState({
      popupState: {
        ...this.state.popupState,
        newLabel
      }
    });
  };
}

SettingLabelsWrapper.propTypes = {
  onAddLabel: PropTypes.func,
  onRemoveLabel: PropTypes.func,
  onUpdateLabel: PropTypes.func
};

export const PopupTypes = {
  NONE: 'NONE',
  REMOVE: 'REMOVE',
  EDIT: 'EDIT'
};

export default SettingLabelsWrapper;
