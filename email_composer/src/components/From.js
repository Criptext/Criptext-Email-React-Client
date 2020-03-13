import React from 'react';
import PropTypes from 'prop-types';
import string from './../lang';
import { APP_DOMAIN } from '../utils/electronInterface';
import './from.scss';

const From = props => (
  <div className="cptx-from-container">
    <div className="cptx-from-content" onClick={() => props.onToggleFrom()}>
      <span className="cptx-recipient-input-label">
        {string.inputLabels.from}
      </span>
      <span className="cptx-from-address">
        {props.accountSelected.alias ||
          (props.accountSelected.recipientId.includes('@')
            ? props.accountSelected.recipientId
            : `${props.accountSelected.recipientId}@${APP_DOMAIN}`)}
      </span>
      {props.accountSelected.alias && (
        <span className="cptx-from-address cptx-alias-origin">
          ({props.accountSelected.recipientId.includes('@')
            ? props.accountSelected.recipientId
            : `${props.accountSelected.recipientId}@${APP_DOMAIN}`})
        </span>
      )}
    </div>
    <div
      className={`cptx-from-more ${
        props.isCollapsedMoreFrom ? 'collapsed' : 'expanded'
      }`}
    >
      <ul>
        {props.accounts.map((account, index) => {
          const classItem =
            account.alias || props.accountSelected.alias
              ? account.alias === props.accountSelected.alias
                ? 'selected'
                : ''
              : account.id === props.accountSelected.id
                ? 'selected'
                : '';
          return (
            <li
              key={index}
              className={classItem}
              onClick={() => props.onClick(account)}
            >
              <span className="cptx-from-address">
                {account.alias ||
                  (account.recipientId.includes('@')
                    ? account.recipientId
                    : `${account.recipientId}@${APP_DOMAIN}`)}
              </span>
              {account.alias && (
                <span className="cptx-from-address cptx-alias-origin">
                  ({account.recipientId.includes('@')
                    ? account.recipientId
                    : `${account.recipientId}@${APP_DOMAIN}`})
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </div>
    {props.allowChangeFrom ? (
      <div
        className="cptx-recipient-toggle"
        onClick={() => props.onToggleFrom()}
      >
        <i
          className={
            props.isCollapsedMoreFrom ? 'icon-arrow-down' : 'icon-arrow-up'
          }
        />
      </div>
    ) : (
      ''
    )}
  </div>
);

From.propTypes = {
  accounts: PropTypes.array,
  accountSelected: PropTypes.object,
  allowChangeFrom: PropTypes.bool,
  isCollapsedMoreFrom: PropTypes.bool,
  onClick: PropTypes.func,
  onToggleFrom: PropTypes.func
};

export default From;
