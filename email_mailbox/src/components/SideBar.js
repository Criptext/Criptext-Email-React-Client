import React from 'react';
import PropTypes from 'prop-types';
import SideBarItem from './SideBarItem';
import Button, { ButtonTypes } from './Button';
import SideBarLabelItem from './../containers/SideBarLabelItem';
import LabelAdd from './../containers/LabelAdd';

import string from './../lang';
import './sidebar.scss';

const SideBar = props => (
  <aside className="sidebar-app">
    <header onClick={() => props.onToggleSideBar()}>
      <div className="header-icon" />
    </header>
    <div className="navigation-partial-mail cptx-scrollbar">
      <div className="nav-item-free">
        <Button
          id={'button-compose'}
          icon={'icon-edit'}
          onClick={props.onClickButtonComposer}
          status={props.buttonComposerStatus}
          text={string.sidebar.compose}
          type={ButtonTypes.PRIMARY}
        />
      </div>
      <nav className="nav-main">
        <ul>
          {props.items.map((item, key) => {
            const selected = props.mailboxSelected
              ? item.id === props.mailboxSelected.id
              : false;
            const mailboxSelected = {
              id: item.id,
              text: item.text
            };
            return (
              <SideBarItem
                onClick={() => {
                  props.onClickSection(mailboxSelected);
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
              <span>{string.sidebar.labels}</span>
              <div className="nav-item-option">
                <i
                  className={
                    props.showLabels ? 'icon-arrow-up' : 'icon-arrow-down'
                  }
                />
              </div>
            </div>
            {renderLabels(
              props.showLabels,
              props.labels,
              props.mailboxSelected,
              props.onClickSection
            )}
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
            <span>{string.sidebar.invite_a_friend}</span>
          </li>
          <li className="nav-item">
            <a
              href="https://criptext.atlassian.net/servicedesk/customer/portals"
              // eslint-disable-next-line react/jsx-no-target-blank
              target="_blank"
            >
              <div className="nav-item-icon">
                <i className="icon-ask" />
              </div>
              <span>{string.settings.contact_support}</span>
            </a>
          </li>
          <li className="nav-item" onClick={() => props.onClickSettings()}>
            <div className="nav-item-icon">
              <i className="icon-settings" />
            </div>
            <span>{string.sidebar.settings}</span>
          </li>
        </ul>
      </nav>
    </div>
  </aside>
);

const renderLabels = (showLabels, labels, mailboxSelected, onClickSection) => (
  <ul>
    {showLabels &&
      labels.map((label, key) => {
        const selected = mailboxSelected
          ? label.text === mailboxSelected.text
          : false;
        return (
          <SideBarLabelItem
            key={key}
            color={label.color}
            id={label.id}
            text={label.text}
            type={label.type}
            uuid={label.uuid}
            selected={selected}
            onClickSection={onClickSection}
          />
        );
      })}
    {showLabels && <LabelAdd />}
  </ul>
);

SideBar.propTypes = {
  buttonComposerStatus: PropTypes.number,
  items: PropTypes.array,
  labels: PropTypes.object,
  mailboxSelected: PropTypes.object,
  onClickButtonComposer: PropTypes.func,
  onClickInviteFriend: PropTypes.func,
  onClickSection: PropTypes.func,
  onClickSettings: PropTypes.func,
  onToggleShowLabelView: PropTypes.func,
  onToggleSideBar: PropTypes.func,
  showLabels: PropTypes.bool
};

export default SideBar;
