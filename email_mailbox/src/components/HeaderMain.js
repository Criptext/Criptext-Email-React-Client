import React from 'react';
import PropTypes from 'prop-types';
import SearchBox from './SearchBox';
import ProfileShortCut from './../containers/ProfileShortCut';
import './headermain.scss';

const HeaderMain = props => (
  <div className="header-main">
    <SearchBox
      allLabels={props.allLabels}
      avatarTimestamp={props.avatarTimestamp}
      isHiddenMenuSearchHints={props.isHiddenMenuSearchHints}
      isHiddenMenuSearchOptions={props.isHiddenMenuSearchOptions}
      getSearchParams={props.getSearchParams}
      onClickSearch={props.onClickSearch}
      onSearchSelectThread={props.onSearchSelectThread}
      onToggleMenuSearchHints={props.onToggleMenuSearchHints}
      onToggleMenuSearchOptions={props.onToggleMenuSearchOptions}
      onTriggerSearch={props.onTriggerSearch}
      searchParams={props.searchParams}
      threads={props.threads}
      hints={props.hints}
    />
    <ProfileShortCut
      onUpdateApp={props.onUpdateApp}
      avatarTimestamp={props.avatarTimestamp}
      onClickSettings={props.onClickSection}
      openLogin={props.openLogin}
    />
  </div>
);

HeaderMain.propTypes = {
  allLabels: PropTypes.array,
  avatarTimestamp: PropTypes.number,
  getSearchParams: PropTypes.func,
  hints: PropTypes.object,
  isHiddenMenuSearchHints: PropTypes.bool,
  isHiddenMenuSearchOptions: PropTypes.bool,
  onClickSearch: PropTypes.func,
  onClickSection: PropTypes.func,
  openLogin: PropTypes.func,
  onSearchSelectThread: PropTypes.func,
  onToggleMenuSearchHints: PropTypes.func,
  onToggleMenuSearchOptions: PropTypes.func,
  onTriggerSearch: PropTypes.func,
  onUpdateApp: PropTypes.func,
  searchParams: PropTypes.object,
  threads: PropTypes.object
};

export default HeaderMain;
