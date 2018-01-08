import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import './sidebaritem.css';

class SideBarItem extends Component {
  constructor() {
    super();
  }

  render() {
    return ( 
      <li className="nav-item">
        <div className="nav-item-icon">
          <i className={this.props.item.icon} />
        </div>
        <Link to={"/"+(this.props.item.id)}>{this.props.item.text}</Link>
        { this.props.item.notification ?
          ( <div className="nav-item-notif">
              <span>+99</span>
        </div> )
          : null
        }
        
      </li>
    );
  }
}

SideBarItem.propTypes = {
  item: PropTypes.object
};

export default SideBarItem;
