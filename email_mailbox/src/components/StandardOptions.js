import React from 'react';
import PropTypes from 'prop-types';
import ButtonCircle from './ButtonCircle';
import './standardoptions.css';

const StandardOptions = props => (
  <div className="header-action">
    <ButtonCircle
      tip="Archive"
      enableTip={true}
      icon="icon-archive"
      targetName="actionArchive"
    />
    <ButtonCircle
      tip="Spam"
      enableTip={true}
      icon="icon-not"
      targetName="actionSpam"
    />
    <ButtonCircle
      tip="Trash"
      enableTip={true}
      icon="icon-trash"
      targetName="actionTrash"
    />
    <ButtonCircle
      onClick={props.onMoveClick}
      tip="Move to"
      enableTip={!props.displayMoveMenu}
      icon="icon-file"
      targetName="actionMove"
    />
    <ButtonCircle
      onClick={props.onTagsClick}
      tip="Add Labels"
      enableTip={!props.displayTagsMenu}
      icon="icon-tag"
      targetName="actionTag"
    />
  </div>
);

StandardOptions.propTypes = {
  displayMoveMenu: PropTypes.bool,
  displayTagsMenu: PropTypes.bool,
  onActionMove: PropTypes.func,
  onMoveClick: PropTypes.func,
  onTagsClick: PropTypes.func
};

export default StandardOptions;
