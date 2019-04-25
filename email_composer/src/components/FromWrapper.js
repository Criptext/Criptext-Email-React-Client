import React, { Component } from 'react';
import PropTypes from 'prop-types';
import From from './From';
import { getAccountByParams } from '../utils/ipc';
import { appDomain } from '../utils/const';

class FromWrapper extends Component {
  constructor(props) {
    super(props);
    this.state = {
      accounts: [],
      accountSelected: {},
      isCollapsedMoreFrom: true
    };
  }

  render() {
    return (
      <From
        accounts={this.state.accounts}
        accountSelected={this.state.accountSelected}
        isCollapsedMoreFrom={this.state.isCollapsedMoreFrom}
        onClick={this.handleClick}
        onToggleFrom={this.handleToggleFrom}
        text={this.props.text}
      />
    );
  }

  componentDidMount() {
    this.getLoggedAccounts();
  }

  handleClick = account => {
    this.setState({ accountSelected: account });
    this.handleToggleFrom();
  };

  handleToggleFrom = () => {
    this.setState({ isCollapsedMoreFrom: !this.state.isCollapsedMoreFrom });
  };

  getLoggedAccounts = async () => {
    try {
      const res = await getAccountByParams({
        isLoggedIn: true
      });
      const accounts = [];
      let accountSelected = {};
      res.forEach(account => {
        const item = {
          id: account.id,
          emailAdress: `${account.recipientId}@${appDomain}`
        };
        accounts.push(item);
        if (account.isActive) {
          accountSelected = item;
        }
      });
      this.setState({ accounts, accountSelected });
    } catch (e) {
      return [];
    }
  };
}

FromWrapper.propTypes = {
  text: PropTypes.string
};

export default FromWrapper;
