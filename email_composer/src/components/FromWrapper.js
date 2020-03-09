import React, { Component } from 'react';
import PropTypes from 'prop-types';
import From from './From';

class FromWrapper extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isCollapsedMoreFrom: true
    };
  }

  render() {
    return (
      <From
        accounts={this.props.accounts}
        accountSelected={this.props.accountSelected}
        allowChangeFrom={this.props.allowChangeFrom}
        isCollapsedMoreFrom={this.state.isCollapsedMoreFrom}
        onClick={this.handleClick}
        onToggleFrom={this.handleToggleFrom}
        text={this.props.text}
      />
    );
  }

  handleClick = account => {
    this.props.getAccount(account);
    this.handleToggleFrom();
  };

  handleToggleFrom = () => {
    if (this.props.allowChangeFrom)
      this.setState({ isCollapsedMoreFrom: !this.state.isCollapsedMoreFrom });
  };
}

FromWrapper.propTypes = {
  accounts: PropTypes.array,
  accountSelected: PropTypes.object,
  allowChangeFrom: PropTypes.bool,
  getAccount: PropTypes.func,
  text: PropTypes.string
};

export default FromWrapper;
