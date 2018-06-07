import React from 'react';
import PropTypes from 'prop-types';
import ActivityPanel from './../containers/ActivityPanel';
import MainWrapper from './MainWrapper';
import SideBar from './../containers/SideBar';
import WelcomeWrapper from './WelcomeWrapper';
import { myAccount } from '../utils/electronInterface';

const Panel = props => (
  <div
    className={
      'wrapper-in ' +
      defineWrapperClass(props.isOpenSideBar, props.isOpenActivityPanel)
    }
  >
    <div className="wrapper-left">
      <SideBar
        mailboxSelected={props.sectionSelected.params.mailboxSelected}
        onClickSection={props.onClickSection}
        onToggleSideBar={props.onToggleSideBar}
      />
      <MainWrapper
        onClickSection={props.onClickSection}
        onClickThreadBack={props.onClickThreadBack}
        onToggleActivityPanel={props.onToggleActivityPanel}
        sectionSelected={props.sectionSelected}
      />
    </div>
    <ActivityPanel
      onClickSection={props.onClickSection}
      onToggleActivityPanel={props.onToggleActivityPanel}
    />
    {props.isOpenWelcome && !myAccount.opened ? (
      <WelcomeWrapper onClickCloseWelcome={props.onClickCloseWelcome} />
    ) : null}
  </div>
);

const defineWrapperClass = (isOpenSideBar, isOpenActivityPanel) => {
  const sidebarClass = isOpenSideBar
    ? 'sidebar-app-expand'
    : 'sidebar-app-collapse';
  const navigationClass = isOpenActivityPanel
    ? ' navigation-feed-expand'
    : ' navigation-feed-collapse';
  return sidebarClass.concat(navigationClass);
};

Panel.propTypes = {
  isOpenActivityPanel: PropTypes.bool,
  isOpenSideBar: PropTypes.bool,
  isOpenWelcome: PropTypes.bool,
  onClickCloseWelcome: PropTypes.func,
  onClickThreadBack: PropTypes.func,
  onClickSection: PropTypes.func,
  onToggleActivityPanel: PropTypes.func,
  onToggleSideBar: PropTypes.func,
  sectionSelected: PropTypes.object
};

export default Panel;
