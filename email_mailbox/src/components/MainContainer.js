import React from 'react';
import PropTypes from 'prop-types';
import MailBox from './MailBox';
import Thread from '../containers/Thread';

const MainContainer = props => {
  switch (props.stance) {
    case 'threads':
      return (
        <MailBox
          mailboxSelected={props.mailboxSelected}
          onClickMailboxSelected={props.onClickMailboxSelected}
          onClickThreadIdSelected={props.onClickThreadIdSelected}
          onToggleActivityPanel={props.onToggleActivityPanel}
        />
      );
    case 'emails':
      return (
        <Thread
          mailboxSelected={props.mailboxSelected}
          onClickThreadBack={props.onClickThreadBack}
          onToggleActivityPanel={props.onToggleActivityPanel}
          threadIdSelected={props.threadIdSelected}
        />
      );
    default:
      return null;
  }
};

MainContainer.propTypes = {
  mailboxSelected: PropTypes.string,
  onClickMailboxSelected: PropTypes.func,
  onClickThreadBack: PropTypes.func,
  onClickThreadIdSelected: PropTypes.func,
  onToggleActivityPanel: PropTypes.func,
  stance: PropTypes.string,
  threadIdSelected: PropTypes.number
};

export default MainContainer;
