import React, { Component } from 'react';
import './header.css';

const Header = props =>{
  return (<header className='mailbox-header'>
    <div className='header-search'>
      <i className='icon-user'>
      </i>
      <input />
    </div>
    <div className='header-profile'>
      DM
    </div>
  </header>);
};

export default Header;