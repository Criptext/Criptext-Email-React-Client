import React from 'react';
import PropTypes from 'prop-types';
import ActivityPanel from './../containers/ActivityPanel';
import MainContainer from './../containers/MainContainer';
import SideBar from './../containers/SideBar';

const Panel = props => (
  <div className="wrapper-in">
    <SideBar
      isOpenSideBar={props.isOpenSideBar}
      mailboxSelected={props.mailboxSelected}
      onClickMailboxSelected={props.onClickMailboxSelected}
      onToggleSideBar={props.onToggleSideBar}
    />
    <div className="main-container">
      <MainContainer
        isOpenActivityPanel={props.isOpenActivityPanel}
        mailbox={props.mailboxSelected}
        threadId={props.threadIdSelected}
        onClickThreadIdSelected={props.onClickThreadIdSelected}
        onClickMailboxSelected={props.onClickMailboxSelected}
        onClickThreadBack={props.onClickThreadBack}
        onToggleActivityPanel={props.onToggleActivityPanel}
      />
    </div>
    {props.isOpenActivityPanel ? (
      <ActivityPanel
        mailboxSelected={props.mailboxSelected}
        onClickThreadIdSelected={props.onClickThreadIdSelected}
        onToggleActivityPanel={props.onToggleActivityPanel}
      />
    ) : null}
  </div>
);

Panel.propTypes = {
  isOpenActivityPanel: PropTypes.bool,
  isOpenSideBar: PropTypes.bool,
  mailboxSelected: PropTypes.string,
  onClickMailboxSelected: PropTypes.func,
  onClickThreadBack: PropTypes.func,
  onClickThreadIdSelected: PropTypes.func,
  onToggleActivityPanel: PropTypes.func,
  onToggleSideBar: PropTypes.func,
  threadIdSelected: PropTypes.number
};

export default Panel;
