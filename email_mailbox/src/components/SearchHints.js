import React from 'react';
import PropTypes from 'prop-types';
import { List } from 'immutable';
import { replaceMatches } from '../utils/ReactUtils';
import './searchhints.scss';

const SearchHints = props => (
  <div className="search-hints">
    {props.errorSuggestions ? (
      <div className="search-hints-error">
        <div>
          <span>:C</span>
        </div>
        <div>
          <span>{props.errorSuggestions}</span>
        </div>
      </div>
    ) : (
      <div className="search-hints-success">
        <SearchSuggestion
          icon="icon-time"
          items={props.hints}
          searchText={props.searchText}
          onClickSearchSuggestiontItem={props.onClickSearchSuggestiontItem}
        />
        <SearchSuggestion
          icon="icon-search"
          items={List([props.searchText])}
          searchText={props.searchText}
          onClickSearchSuggestiontItem={props.onClickSearchSuggestiontItem}
        />
        {props.searchText &&
          props.threads.map((thread, index) => (
            <SearchMail
              key={index}
              threadId={thread.get('threadId')}
              preview={thread.get('preview')}
              date={thread.get('date')}
              participants={thread.get('fromContactName')}
              searchText={props.searchText}
              onSearchSelectThread={props.onSearchSelectThread}
            />
          ))}
      </div>
    )}
  </div>
);

const SearchSuggestion = props => {
  if (props.items.size === 0) {
    return null;
  }
  return props.items.map((item, index) => (
    <div
      className="search-recent"
      onClick={() => {
        props.onClickSearchSuggestiontItem(item);
      }}
      key={index}
    >
      <i className={props.icon} />
      {replaceMatches(props.searchText, item)}
    </div>
  ));
};

const SearchMail = props => {
  const previewMatches = replaceMatches(props.searchText, props.preview);
  return (
    <div
      className="search-mail"
      onClick={() => {
        props.onSearchSelectThread(props.threadId);
      }}
    >
      <i className="icon-mail" />
      <div>
        <div>
          <span>{previewMatches}</span>
          <span>{props.participants}</span>
        </div>
        <div>
          <span>{props.date}</span>
        </div>
      </div>
    </div>
  );
};

SearchMail.propTypes = {
  date: PropTypes.string,
  threadId: PropTypes.string,
  participants: PropTypes.string,
  preview: PropTypes.string,
  searchText: PropTypes.string,
  onSearchSelectThread: PropTypes.func
};

SearchSuggestion.propTypes = {
  icon: PropTypes.string,
  items: PropTypes.object,
  searchText: PropTypes.string
};

SearchHints.defaultProps = {
  hints: List([]),
  threads: []
};

SearchHints.propTypes = {
  errorSuggestions: PropTypes.string,
  hints: PropTypes.object,
  onClickSearchSuggestiontItem: PropTypes.func,
  onSearchSelectThread: PropTypes.func,
  searchText: PropTypes.string,
  threads: PropTypes.object
};

export default SearchHints;
