import React, { Component } from 'react';
import PropTypes from 'prop-types';
import SettingLabels from './SettingLabels';

class SettingLabelsWrapper extends Component {
  constructor(props) {
    super(props);
    this.state = {
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

  handleClickRemoveLabel = (labelId, labelUuid) => {
    this.props.onRemoveLabel(labelId, labelUuid);
  };

  handleClickChangeLabelVisibility = (nextCheckedValue, id) => {
    const visible = nextCheckedValue === 'all';
    this.props.onUpdateLabel({ id, visible });
  };
}

SettingLabelsWrapper.propTypes = {
  onAddLabel: PropTypes.func,
  onRemoveLabel: PropTypes.func,
  onUpdateLabel: PropTypes.func
};

export default SettingLabelsWrapper;
