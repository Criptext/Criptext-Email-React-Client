import React, { Component } from 'react';
import SelectHeader from './SelectHeader';
import Header from './Header'
import './header.css';

class HeaderWrapper extends Component {
  constructor() {
    super();
    this.state = {
      search: "",
      displayMoveMenu: false,
      displayTagsMenu: false
    };
  }

  render() {
    return this.props.multiselect 
      ? <SelectHeader 
        displayMoveMenu={this.state.displayMoveMenu} 
        displayTagsMenu={this.state.displayTagsMenu}
        toggleMoveMenu={this.toggleMoveMenu}
        toggleTagsMenu={this.toggleTagsMenu} 
        {...this.props} />
      : <Header {...this.props}/>;
  }

  toggleMoveMenu = () => {
    this.setState({
      displayMoveMenu: !this.state.displayMoveMenu
    })
  }

  toggleTagsMenu = () => {
    this.setState({
      displayTagsMenu: !this.state.displayTagsMenu
    })
  }

};

export default HeaderWrapper;