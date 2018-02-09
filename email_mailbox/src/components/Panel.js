import React from 'react';
import PropTypes from 'prop-types';
import ActivityPanel from './../containers/ActivityPanel';
import MainContainer from './../containers/MainContainer';
import SideBar from './../containers/SideBar';

const Panel = props => (
  <div className="wrapper-in">
    <SideBar
      mailboxSelected={props.mailboxSelected}
      onClickMailboxSelected={props.onClickMailboxSelected}
    />
    <div className="main-container">
      <MainContainer
        mailbox={props.mailboxSelected}
        threadId={props.threadIdSelected}
        onClickThreadIdSelected={props.onClickThreadIdSelected}
        onClickMailboxSelected={props.onClickMailboxSelected}
        onClickThreadBack={props.onClickThreadBack}
      />
    </div>
    <ActivityPanel />
  </div>
);

Panel.propTypes = {
  mailboxSelected: PropTypes.string,
  onClickMailboxSelected: PropTypes.func,
  onClickThreadBack: PropTypes.func,
  onClickThreadIdSelected: PropTypes.func,
  threadIdSelected: PropTypes.number
};

export default Panel;
