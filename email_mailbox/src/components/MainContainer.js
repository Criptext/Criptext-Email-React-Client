import React from 'react';
import MailBox from './MailBox';
import Thread from '../containers/Thread';

const MainContainer = props => {
  switch(props.stance){
    case 'threads':
      return <MailBox />
    case 'emails':
      return <Thread />
    default: 
      return null
  }
}

export default MainContainer;