import React from 'react';
import HeaderThreadOptionsWrapper from './HeaderThreadOptionsWrapper';
import './threadheader.css';

const ThreadHeader = props => (
  <div className="thread-header">
    <HeaderThreadOptionsWrapper {...props} />
  </div>
);

export default ThreadHeader;
