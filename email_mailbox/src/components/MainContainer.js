import React from 'react';
import PropTypes from 'prop-types';
import MailBox from './MailBox';
import Thread from '../containers/Thread';

const MainContainer = props => {
  switch (props.stance) {
    case 'threads':
      return (
        <MailBox
          mailbox={props.mailbox}
          onClickThreadIdSelected={props.onClickThreadIdSelected}
          onClickMailboxSelected={props.onClickMailboxSelected}
        />
      );
    case 'emails':
      return (
        <Thread
          threadId={props.threadId}
          onClickThreadBack={props.onClickThreadBack}
        />
      );
    default:
      return null;
  }
};

MainContainer.propTypes = {
  mailbox: PropTypes.string,
  onClickMailboxSelected: PropTypes.func,
  onClickThreadBack: PropTypes.func,
  onClickThreadIdSelected: PropTypes.func,
  stance: PropTypes.string,
  threadId: PropTypes.number
};

export default MainContainer;
