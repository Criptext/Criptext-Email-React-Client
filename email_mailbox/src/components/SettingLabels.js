import React from 'react';
import PropTypes from 'prop-types';
import './settinglabel.scss';
import CustomCheckbox from './CustomCheckbox';

const SettingLabels = props => (
  <div id="setting-labels">
    {renderSystemLabelsBlock(props)}
    {renderCustomLabelsBlock(props)}
  </div>
);

const renderSystemLabelsBlock = props => (
  <div className="section-block">
    <div className="section-system-labels">
      <div className="system-labels-list-header">
        <div className="header-left">System Labels</div>
        <div className="header-rigth">Show in label list</div>
      </div>
      <div className="system-labels-list-content">
        {props.systemLabels.map((systemLabel, index) =>
          renderSystemLabelItem(
            index,
            systemLabel,
            props.onClickChangeLabelVisibility
          )
        )}
      </div>
    </div>
  </div>
);

const renderSystemLabelItem = (index, systemLabelItem, onChange) => (
  <div className="system-label-list-item" key={index}>
    <div className="system-label-name">{systemLabelItem.text}</div>
    <div className="system-label-visibility">
      <CustomCheckbox
        onCheck={checked => {
          onChange(checked, systemLabelItem.id);
        }}
        label={null}
        status={systemLabelItem.visible ? 'all' : 'none'}
      />
    </div>
  </div>
);

const renderCustomLabelsBlock = props => (
  <div className="section-block">
    <div className="section-custom-labels">
      <div className="custom-labels-list-header">
        <div className="header-left">Labels</div>
        <div className="header-center">Show in label list</div>
        <div className="header-rigth">Action</div>
      </div>
      <div className="custom-labels-list-content">
        {props.customLabels.map((customLabel, index) =>
          renderCustomLabelItem(index, customLabel, props)
        )}
        {renderInputAddNewLabel(props)}
      </div>
    </div>
  </div>
);

const renderCustomLabelItem = (index, customLabelItem, props) => (
  <div className="custom-label-list-item" key={index}>
    <div className="custom-label-name">{customLabelItem.text}</div>
    <div className="custom-label-visibility">
      <CustomCheckbox
        onCheck={checked => {
          props.onClickChangeLabelVisibility(checked, customLabelItem.id);
        }}
        label={null}
        status={customLabelItem.visible ? 'all' : 'none'}
      />
    </div>
    <div
      className="custom-label-action"
      onClick={() => props.onClickRemoveLabel(customLabelItem.id)}
    >
      Remove
    </div>
  </div>
);

const renderInputAddNewLabel = props => (
  <div className="custom-labels-add">
    <div className="custom-label-input">
      {props.isAddinglabel ? (
        <input
          className="input-a"
          type="text"
          placeholder="Enter new label name"
          value={props.labelToAdd}
          onChange={e => props.onAddLabelInputChanged(e)}
          onKeyPress={e => props.onAddLabelInputKeyPressed(e)}
          autoFocus={true}
        />
      ) : null}
    </div>
    <div
      className="custom-label-button"
      onClick={e => props.onToggleAddLabelButtonClicked(e)}
    >
      {props.isAddinglabel ? (
        <span>Cancel</span>
      ) : (
        <span>Create new label</span>
      )}
    </div>
  </div>
);

renderSystemLabelsBlock.propTypes = {
  systemLabels: PropTypes.array,
  onClickChangeLabelVisibility: PropTypes.func
};

renderCustomLabelsBlock.propTypes = {
  customLabels: PropTypes.array
};

renderCustomLabelItem.propTypes = {
  onClickChangeLabelVisibility: PropTypes.func,
  onClickRemoveLabel: PropTypes.func
};

renderInputAddNewLabel.propTypes = {
  isAddinglabel: PropTypes.bool,
  labelToAdd: PropTypes.string,
  onAddLabelInputChanged: PropTypes.func,
  onAddLabelInputKeyPressed: PropTypes.func,
  onToggleAddLabelButtonClicked: PropTypes.func
};

export default SettingLabels;
