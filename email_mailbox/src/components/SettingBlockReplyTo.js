import React from 'react';
import PropTypes from 'prop-types';
import { Switch } from 'react-switch-input';
import string from '../lang';
import './settingblockreplyto.scss';

const SettingBlockReplyTo = props => (
  <div id="settings-general-reply-to" className="cptx-section-item">
    <span className="cptx-section-item-title">
      {string.settings.reply_to_email}
    </span>
    <span className="cptx-section-item-description">
      {props.replyToEmail || string.settings.reply_to_not_set}
    </span>
    <div className="cptx-section-item-control">
      {props.replyToEmail &&
        !props.replyToIsLoading && (
          <button
            className="button-b"
            onClick={() => props.onClickSetReplyTo()}
          >
            <span>{string.settings.change}</span>
          </button>
        )}
      {props.replyToIsLoading ? (
        <Loader />
      ) : (
        <Switch
          theme="two"
          name="replyToSwitch"
          onChange={
            props.replyToEmail ? props.onRemoveReplyTo : props.onClickSetReplyTo
          }
          checked={!!props.replyToEmail}
          disabled={props.replyToIsLoading}
        />
      )}
    </div>
  </div>
);

const Loader = () => (
  <div className="loading-ring">
    <div />
    <div />
    <div />
    <div />
  </div>
);

SettingBlockReplyTo.propTypes = {
  replyToIsLoading: PropTypes.bool,
  replyToEmail: PropTypes.string,
  onClickSetReplyTo: PropTypes.func,
  onRemoveReplyTo: PropTypes.func
};

export default SettingBlockReplyTo;
