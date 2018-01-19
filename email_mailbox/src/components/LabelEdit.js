import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './labeledit.css';

class LabelEdit extends Component {
  constructor() {
    super();
    this.state = {
      addLabel: false,
      labelToAdd: ''
    };
  }

  render() {
    return (
      <div className="label-container">
        <div className="label-input">
          {this.state.addLabel ? (
            <input
              type="text"
              placeholder="Enter new label name"
              value={this.state.labelToAdd}
              onChange={e => this.handleAddLabelInputChanged(e)}
              onKeyPress={e => this.handleAddLabelInputKeyPressed(e)}
            />
          ) : null}
        </div>
        <div
          className="label-button"
          onClick={e => this.handleToggleAddLabelButtonClicked(e)}
        >
          <span>{this.state.addLabel ? '-' : '+'}</span>
        </div>
      </div>
    );
  }

  handleToggleAddLabelButtonClicked = () => {
    this.setState({ addLabel: !this.state.addLabel });
  };

  handleAddLabelInputChanged = e => {
    this.setState({ labelToAdd: e.target.value });
  };

  handleAddLabelInputKeyPressed = e => {
    if (e.key === 'Enter' && e.target.value.trim() !== '') {
      this.props.onAddLabel(e.target.value.trim());
      this.setState({
        labelToAdd: '',
        addLabel: false
      });
    }
  };
}

LabelEdit.propTypes = {
  labels: PropTypes.object,
  onAddLabel: PropTypes.func
};

export default LabelEdit;
