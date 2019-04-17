import { connect } from 'react-redux';
import { getAllAccounts } from '../selectors/accounts';
import ProfileShortCutWrapper from '../components/ProfileShortCutWrapper';

const ADDED_ACCOUNTS_LIMIT = 3;

const defineBadgeAccount = accounts => {
  const result = accounts.findIndex(account => !!account.badge);
  return result >= 0;
};

const mapStateToProps = state => {
  const accounts = getAllAccounts(state);
  const accountsLimitReached = accounts.length >= ADDED_ACCOUNTS_LIMIT;
  const badgeAccount = defineBadgeAccount(accounts);
  return {
    accounts,
    accountsLimitReached,
    badgeAccount
  };
};

const ProfileShortCut = connect(mapStateToProps, null)(ProfileShortCutWrapper);

export default ProfileShortCut;
