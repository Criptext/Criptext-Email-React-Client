import React from 'react';
import PropTypes from 'prop-types';
import './settinglabel.scss';
import CustomCheckbox from './CustomCheckbox';
import RemoveLabelPopup from './RemoveLabelPopup';
import string from './../lang';
import PopupHOC from './PopupHOC';

const RemovingLabelPopup = PopupHOC(RemoveLabelPopup);

const SettingLabels = props => (
  <div id="setting-labels">
    <div className="cptx-section-block">
      {!props.isHiddenRemoveLabelPopup && renderRemoveLabelPopup(props)}
      <div className="cptx-section-block-title">
        <h1>{string.settings.system_labels}</h1>
      </div>
      <div className="cptx-section-block-content">
        {renderSystemLabelsBlock(props)}
      </div>
      <div className="cptx-section-block-title">
        <h1>{string.settings.user_labels}</h1>
      </div>
      <div className="cptx-section-block-content">
        {renderCustomLabelsBlock(props)}
      </div>
    </div>
  </div>
);

const renderRemoveLabelPopup = props => (
  <RemovingLabelPopup
    isHidden={props.isHiddenRemoveLabelPopup}
    popupPosition={{ left: '45%', top: '45%' }}
    onTogglePopup={props.onClickCancelRemoveDevice}
    theme={'dark'}
    {...props}
  />
);

const renderSystemLabelsBlock = props => (
  <div className="cptx-section-item">
    <div className="section-block-table">
      <div className="table-header">
        <div className="table-column-a">
          <h1>{string.settings.system_labels}</h1>
        </div>
        <div className="table-column-b">
          <h1>{string.settings.show_in_label_list}</h1>
        </div>
      </div>
      <div className="table-body">
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
  <div className="table-row table-system-label" key={index}>
    <div className="table-column-a">
      <span>{systemLabelItem.text}</span>
    </div>
    <div className="table-column-b">
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
  <div className="cptx-section-item">
    <div className="section-block-table">
      <div className="table-header">
        <div className="table-column-a">
          <h1>{string.sidebar.labels}</h1>
        </div>
        <div className="table-column-b">
          <h1>{string.settings.show_in_label_list}</h1>
        </div>
        {props.exist && (
          <div className="table-column-c">
            <h1>{string.settings.action}</h1>
          </div>
        )}
      </div>
      <div className="table-body">
        {props.customLabels.map((customLabel, index) =>
          renderCustomLabelItem(index, customLabel, props)
        )}
        {renderInputAddNewLabel(props)}
      </div>
    </div>
  </div>
);

const renderCustomLabelItem = (index, customLabelItem, props) => (
  <div className="table-row" key={index}>
    <div className="table-column-a">
      <span>{customLabelItem.text}</span>
    </div>
    <div className="table-column-b">
      <CustomCheckbox
        onCheck={checked => {
          props.onClickChangeLabelVisibility(checked, customLabelItem.id);
        }}
        label={null}
        status={customLabelItem.visible ? 'all' : 'none'}
      />
    </div>
    <div
      className="table-column-c"
      onClick={() => props.onClickRemoveLabel({ ...customLabelItem })}
    >
      {string.settings.remove}
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
          placeholder={string.settings.enter_new_label_name}
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
        <span>{string.settings.cancel}</span>
      ) : (
        <span>{string.settings.create_new_label}</span>
      )}
    </div>
  </div>
);

renderSystemLabelsBlock.propTypes = {
  systemLabels: PropTypes.array,
  onClickChangeLabelVisibility: PropTypes.func
};

renderCustomLabelsBlock.propTypes = {
  customLabels: PropTypes.array,
  exist: PropTypes.bool
};

renderCustomLabelItem.propTypes = {
  onClickChangeLabelVisibility: PropTypes.func,
  onClickRemoveLabel: PropTypes.func
};

renderRemoveLabelPopup.propTypes = {
  isHiddenRemoveLabelPopup: PropTypes.bool,
  onClickCancelRemoveDevice: PropTypes.func
};

renderInputAddNewLabel.propTypes = {
  isAddinglabel: PropTypes.bool,
  labelToAdd: PropTypes.string,
  onAddLabelInputChanged: PropTypes.func,
  onAddLabelInputKeyPressed: PropTypes.func,
  onToggleAddLabelButtonClicked: PropTypes.func
};

SettingLabels.propTypes = {
  isHiddenRemoveLabelPopup: PropTypes.bool
};

export default SettingLabels;
