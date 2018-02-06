import { connect } from 'react-redux';
import MainContainerView from '../components/MainContainer';

const mapStateToProps = (state, ownProps) => {
  let stance = '';
  if (ownProps.threadId) {
    stance = 'emails';
  } else if (ownProps.mailbox) {
    stance = 'threads';
  }

  return {
    stance
  };
};

const MainContainer = connect(mapStateToProps, null)(MainContainerView);

export default MainContainer;
