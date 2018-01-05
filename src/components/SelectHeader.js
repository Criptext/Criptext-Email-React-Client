import React, { Component } from 'react';
import './header.css';

const SelectHeader = props =>{
  return (<header className='mailbox-header'>
    <div>
      <div className='header-action'>
        <div>
          <i className='icon-checked'></i>
        </div>
        <div>
          <i className='icon-checked'></i>
        </div>
      </div>
      <div>
        256 Selected
      </div>
    </div>
    <div className='header-action'>
      <div>
        <i className='icon-checked'></i>
      </div>
      <div>
        <i className='icon-checked'></i>
      </div>
      <div>
        <i className='icon-checked'></i>
      </div>
      <div>
        <i className='icon-checked'></i>
      </div>
      <div>
        <i className='icon-checked'></i>
      </div>
    </div>
    <div className='header-action'>
      <div>
        <i className='icon-checked'></i>
      </div>
    </div>
  </header>);
};

export default SelectHeader;