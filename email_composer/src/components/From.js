import React from 'react';
import PropTypes from 'prop-types';
import string from './../lang';
import './from.scss';

const From = props => (
  <div
    className={`cptx-from-container ${defineClassComponent(
      props.accounts.length === 1
    )}`}
  >
    <div className="cptx-from-content" onClick={() => props.onToggleFrom()}>
      <span className="cptx-recipient-input-label">
        {string.inputLabels.from}
      </span>
      <span className="cptx-from-address">
        {props.accountSelected.emailAddress}
      </span>
    </div>
    <div
      className={`cptx-from-more ${
        props.isCollapsedMoreFrom ? 'collapsed' : 'expanded'
      }`}
    >
      <ul>
        {props.accounts.map(account => {
          const classItem =
            account.id === props.accountSelected.id ? 'selected' : '';
          return (
            <li
              key={account.id}
              className={classItem}
              onClick={() => props.onClick(account)}
            >
              <span className="cptx-from-address">{account.emailAddress}</span>
            </li>
          );
        })}
      </ul>
    </div>
    <div className="cptx-recipient-toggle" onClick={() => props.onToggleFrom()}>
      <i
        className={
          props.isCollapsedMoreFrom ? 'icon-arrow-down' : 'icon-arrow-up'
        }
      />
    </div>
  </div>
);

const defineClassComponent = hasOnlyOneAccount => {
  if (hasOnlyOneAccount) {
    return 'hidden';
  }
  return '';
};

From.propTypes = {
  accounts: PropTypes.array,
  accountSelected: PropTypes.object,
  isCollapsedMoreFrom: PropTypes.bool,
  onToggleFrom: PropTypes.func
};

export default From;
