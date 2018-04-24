import { connect } from 'react-redux';
import { loadEmails, loadThreads } from '../actions';
import PanelWrapper from '../components/PanelWrapper';

const defineWrapperClass = (isOpenSideBar, isOpenActivityPanel) => {
  const sidebarClass = isOpenSideBar
    ? 'sidebar-app-expand'
    : 'sidebar-app-collapse';
  const navigationClass = isOpenActivityPanel
    ? ' navigation-feed-expand'
    : ' navigation-feed-collapse';
  return sidebarClass.concat(navigationClass);
};

const mapStateToProps = state => {
  const threadsCount = state.get('threads').size;
  return {
    threadsCount
  };
};

const mapDispatchToProps = dispatch => {
  return {
    onLoadEmails: threadId => {
      dispatch(loadEmails(threadId));
    },
    onLoadThreads: params => {
      dispatch(loadThreads(params));
    },
    defineWrapperClass: (isOpenSideBar, isOpenActivityPanel) => {
      return defineWrapperClass(isOpenSideBar, isOpenActivityPanel);
    }
  };
};

const Panel = connect(mapStateToProps, mapDispatchToProps)(PanelWrapper);

export default Panel;
