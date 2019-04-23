import React from 'react';
import PropTypes from 'prop-types';
import string from './../lang';
import './from.scss';

const accounts = [
  { id: 1, emailAdress: 'erika@criptext.com' },
  { id: 2, emailAdress: 'erika1@criptext.com' },
  { id: 3, emailAdress: 'erika2@criptext.com' }
];

const From = props => (
  <div className="cptx-from-container">
    <div className="cptx-from-content" onClick={() => props.onToggleFrom()}>
      <span className="cptx-recipient-input-label">
        {string.inputLabels.from}
      </span>
      <span className="cptx-from-address">
        {props.accountSelected.emailAdress}
      </span>
    </div>
    <div
      className={`cptx-from-more ${
        props.isCollapsedMoreFrom ? 'collapsed' : 'expanded'
      }`}
    >
      <ul>
        {accounts.map(account => {
          const classItem =
            account.id === props.accountSelected.id ? 'selected' : '';
          return (
            <li
              key={account.id}
              className={classItem}
              onClick={() => props.onClick(account)}
            >
              <span className="cptx-from-address">{account.emailAdress}</span>
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

From.propTypes = {
  accountSelected: PropTypes.object,
  isCollapsedMoreFrom: PropTypes.bool,
  onToggleFrom: PropTypes.func
};

export default From;
