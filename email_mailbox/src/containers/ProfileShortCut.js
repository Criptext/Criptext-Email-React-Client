import { connect } from 'react-redux';
import { getAllAccounts } from '../selectors/accounts';
import ProfileShortCutWrapper from '../components/ProfileShortCutWrapper';

const mapStateToProps = state => {
  const accounts = getAllAccounts(state);
  return {
    accounts
  };
};

const ProfileShortCut = connect(
  mapStateToProps,
  null
)(ProfileShortCutWrapper);

export default ProfileShortCut;
