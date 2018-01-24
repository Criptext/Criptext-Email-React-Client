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
    className={`email-container email-container-collapse ${props.classStatus}`}
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
          <div>
            <span className="email-header-info-to">
              Allison, Daniel, Gabriel, 2 others
            </span>
            <i className="icon-arrow-down" />
          </div>
        </div>
        <div className="email-detail-info">
          <span>{props.email.get('date')}</span>
          <i className="icon-bell" />
          <i className="icon-replay" />
          <i
            id="email-more"
            className="icon-dots"
            onClick={props.onToogleMenu}
          />
          {props.displayMenu ? renderMenu() : null}
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
            <i className="icon-unsend" />
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
      <div>
        <i className="icon-replay" />
        <span>Replay</span>
      </div>
      <div>
        <i className="icon-replay-all" />
        <span>Replay All</span>
      </div>
      <div>
        <i className="icon-forward" />
        <span>Forward</span>
      </div>
    </div>
  </div>
);

const renderMenu = () => (
  <div className="email-more-menu">
    <ul>
      <li>
        <span>Replay</span>
      </li>
      <li>
        <span>Replay All</span>
      </li>
      <li>
        <span>Forward</span>
      </li>
      <li>
        <span>Delete</span>
      </li>
      <li>
        <span>Mark as Unread</span>
      </li>
      <li>
        <span>Mark as Spam</span>
      </li>
      <li>
        <span>Print</span>
      </li>
    </ul>
  </div>
);

renderEmailCollapse.propTypes = {
  classStatus: PropTypes.string,
  email: PropTypes.object,
  onToggleEmail: PropTypes.func
};

renderEmailExpand.propTypes = {
  displayMenu: PropTypes.bool,
  email: PropTypes.object,
  onToggleEmail: PropTypes.func,
  onToogleMenu: PropTypes.func
};

Email.propTypes = {
  email: PropTypes.object
};

export default Email;
