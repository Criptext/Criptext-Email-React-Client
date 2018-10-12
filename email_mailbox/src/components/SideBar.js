import React from 'react';
import PropTypes from 'prop-types';
import SideBarItem from './../components/SideBarItem';
import SideBarLabelItem from './../containers/SideBarLabelItem';
import LabelAdd from './../containers/LabelAdd';
import { openComposerWindow } from '../utils/electronInterface';
import './sidebar.css';

const SideBar = props => (
  <aside className="sidebar-app">
    <header onClick={() => props.onToggleSideBar()}>
      <div className="header-icon" />
    </header>
    <div className="navigation-partial-mail">
      <div className="nav-item-free">
        <button
          className="button button-a button-compose"
          onClick={openComposerWindow}
        >
          <i className="icon-edit" />
          <span>Compose</span>
        </button>
      </div>
      <nav className="nav-main">
        <ul>
          {props.items.map((item, key) => {
            const selected = item.idText === props.mailboxSelected;
            return (
              <SideBarItem
                onClick={() => {
                  props.onClickSection(item.idText);
                }}
                key={key}
                item={item}
                selected={selected}
              />
            );
          })}
          <li
            className={
              'nav-item nav-item-more ' +
              (props.showLabels ? 'nav-item-more-selected' : '')
            }
          >
            <hr />
            <div
              className="nav-item-container"
              onClick={e => props.onToggleShowLabelView(e)}
            >
              <div className="nav-item-icon">
                <i className="icon-tag" />
              </div>
              <span>Labels</span>
              <div className="nav-item-option">
                <i
                  className={
                    props.showLabels ? 'icon-arrow-up' : 'icon-arrow-down'
                  }
                />
              </div>
            </div>
            {renderLabels(props.showLabels, props.labels)}
          </li>
        </ul>
      </nav>
      <nav className="nav-footer">
        <hr />
        <ul>
          <li className="nav-item" onClick={() => props.onClickInviteFriend()}>
            <div className="nav-item-icon">
              <i className="icon-add-friend" />
            </div>
            <span>Invite a Friend</span>
          </li>
          <li className="nav-item" onClick={() => props.onClickSettings()}>
            <div className="nav-item-icon">
              <i className="icon-settings" />
            </div>
            <span>Settings</span>
          </li>
        </ul>
      </nav>
    </div>
  </aside>
);

const renderLabels = (showLabels, labels) => (
  <ul>
    {showLabels &&
      labels.map((label, key) => {
        return <SideBarLabelItem key={key} label={label} />;
      })}
    {showLabels && <LabelAdd />}
  </ul>
);

SideBar.propTypes = {
  items: PropTypes.array,
  labels: PropTypes.object,
  mailboxSelected: PropTypes.string,
  onClickInviteFriend: PropTypes.func,
  onClickSettings: PropTypes.func,
  onToggleShowLabelView: PropTypes.func,
  onToggleSideBar: PropTypes.func,
  showLabels: PropTypes.bool
};

export default SideBar;
