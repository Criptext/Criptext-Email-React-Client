import { connect } from 'react-redux';
import MainContainerView from '../components/MainContainer';

const mapStateToProps = (state, ownProps) => {
  let stance = '';
  if (ownProps.threadIdSelected) {
    stance = 'emails';
  } else if (ownProps.mailboxSelected) {
    stance = 'threads';
  }

  return {
    stance
  };
};

const MainContainer = connect(mapStateToProps, null)(MainContainerView);

export default MainContainer;
