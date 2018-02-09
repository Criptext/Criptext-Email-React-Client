import React from 'react';
import { closeLoading, openMailbox } from './../utils/electronInterface';
import './loading.css';


const animation = () => {
  window.setTimeout(() => {
    openMailbox();
    closeLoading();
  }, 3000);
}


const Loading = () => renderLoading();


const renderLoading = () => (
  <div className="loading-body">

    <div className="content">
      <div className="logo">
        <div className="icon"></div>
      </div>

      <div className="bar">
        <div className="content">
        </div>
      </div>
      
      <div className="percent">
        <div className="content">
          <span className="number">60%</span> 
        </div>
      </div>

      <div className="message">
        <span>Creating Keys</span>
      </div>
    </div>

  </div>
)


export default Loading;
