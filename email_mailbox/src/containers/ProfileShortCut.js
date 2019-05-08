import { connect } from 'react-redux';
import { getAllAccounts } from '../selectors/accounts';
import ProfileShortCutWrapper from '../components/ProfileShortCutWrapper';

const ADDED_ACCOUNTS_LIMIT = 3;

const mapStateToProps = state => {
  const accounts = getAllAccounts(state);
  const accountsLimitReached = accounts.length >= ADDED_ACCOUNTS_LIMIT;
  return {
    accounts,
    accountsLimitReached
  };
};

const ProfileShortCut = connect(
  mapStateToProps,
  null
)(ProfileShortCutWrapper);

export default ProfileShortCut;
