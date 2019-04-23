import React, { Component } from 'react';
import PropTypes from 'prop-types';
import From from './From';

class FromWrapper extends Component {
  constructor(props) {
    super(props);
    this.state = {
      accountSelected: { id: 1, emailAdress: 'erika@criptext.com' },
      isCollapsedMoreFrom: true
    };
  }

  render() {
    return (
      <From
        accountSelected={this.state.accountSelected}
        isCollapsedMoreFrom={this.state.isCollapsedMoreFrom}
        onClick={this.handleClick}
        onToggleFrom={this.handleToggleFrom}
        text={this.props.text}
      />
    );
  }

  handleClick = account => {
    this.setState({ accountSelected: account });
    this.handleToggleFrom();
  };

  handleToggleFrom = () => {
    this.setState({ isCollapsedMoreFrom: !this.state.isCollapsedMoreFrom });
  };
}

FromWrapper.propTypes = {
  text: PropTypes.string
};

export default FromWrapper;
