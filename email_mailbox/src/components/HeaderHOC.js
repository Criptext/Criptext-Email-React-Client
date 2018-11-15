import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ActivityPanelShortCut from './ActivityPanelShortCut';
import './headerhoc.scss';

const HeaderHOC = InComponent =>
  class Menu extends Component {
    static propTypes = {
      onToggleActivityPanel: PropTypes.func
    };

    render() {
      return (
        <header className="header-container">
          <div className="header-content">
            <InComponent {...this.props} />
          </div>
          <ActivityPanelShortCut onClick={this.props.onToggleActivityPanel} />
        </header>
      );
    }
  };

export default HeaderHOC;
