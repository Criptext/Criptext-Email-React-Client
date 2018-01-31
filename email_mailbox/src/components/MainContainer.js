import React from 'react';
import PropTypes from 'prop-types';
import MailBox from './MailBox';
import Thread from '../containers/Thread';

const MainContainer = props => {
  switch (props.stance) {
    case 'threads':
      return <MailBox />;
    case 'emails':
      return <Thread />;
    default:
      return null;
  }
};

MainContainer.propTypes = {
  stance: PropTypes.string
};

export default MainContainer;
