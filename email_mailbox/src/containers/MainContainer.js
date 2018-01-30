import { connect } from 'react-redux';
import MainContainerView from '../components/MainContainer';

const mapStateToProps = (state, ownProps) => {
  return {
    stance: state.get('activities').get('stance')
  };
};

const mapDispatchToProps = dispatch => {
  return {};
};

const MainContainer = connect(mapStateToProps, mapDispatchToProps)(MainContainerView);

export default MainContainer;