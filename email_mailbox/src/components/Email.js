import React from 'react';
import PropTypes from 'prop-types';
import AttachItem from './AttachItem';
import './email.css';

const Email = props =>
  props.displayEmail || props.staticOpen
    ? renderEmailExpand(props)
    : renderEmailCollapse(props);

const renderEmailCollapse = props => (
  <div
    className="email-container email-container-collapse"
    onClick={props.onToggleEmail}
  >
    <span className="email-preview-from">{props.email.get('from')}</span>
    <span className="email-preview-content">
      Lorem Ipsum is simply dummy text of the printing and
    </span>
    <div className="email-preview-info">
      <i className="icon-attach" />
      <i className="icon-checked" />
    </div>
    <span className="email-preview-date">{props.email.get('date')}</span>
  </div>
);

const renderEmailExpand = props => (
  <div>
    <div className="email-container email-container-expand">
      <div className="email-info" onClick={props.onToggleEmail}>
        <div className="email-icon-letter">
          <span>DM</span>
        </div>
        <div className="email-header-info">
          <span className="email-header-info-from">
            {props.email.get('from')}
          </span>
          <span className="email-header-info-to">
            Allison, Daniel, Gabriel, 2 others
          </span>
        </div>
        <div className="email-detail-info">
          <span>{props.email.get('date')}</span>
          <i className="icon-bell" />
          <i className="icon-replay" />
          <i className="icon-dots" />
        </div>
      </div>
      <div className="email-body">
        <div className="email-options">
          <div>
            <i className="icon-attach" />
          </div>
          <div>
            <i className="icon-checked" />
          </div>
          <button className="button-a button-unsend">
            <i className="icon-sent-left" />
            <span>unsend</span>
          </button>
        </div>
        <div className="email-text">
          <p>Lorem Ipsum is simply dummy text of the printing and</p>
        </div>
        <div className="email-attachs">
          <AttachItem
            image={
              'https://cdn-img-feed.streeteasy.com/nyc/image/50/300089950.jpg'
            }
          />
        </div>
      </div>
    </div>
    <div className="email-segment-controls">
      <div><i className="icon-replay"/><span>Replay</span></div>
      <div><i className="icon-replay-all"/><span>Replay All</span></div>
      <div><i className="icon-forward"/><span>Forward</span></div>
    </div>
  </div>
);

renderEmailCollapse.propTypes = {
  email: PropTypes.object,
  onToggleEmail: PropTypes.func
};

renderEmailExpand.propTypes = {
  email: PropTypes.object,
  onToggleEmail: PropTypes.func
};

Email.propTypes = {
  email: PropTypes.object
};

export default Email;
