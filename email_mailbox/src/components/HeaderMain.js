import React, { Component } from 'react';
import PropTypes from 'prop-types';
import TooltipMenu from './TooltipMenu';
import CustomCheckbox from './CustomCheckbox';
import SearchBox from './SearchBox';
import { replaceMatches } from '../utils/ReactUtils';
import './headermain.css';

class HeaderMain extends Component {
  render() {
    const { searchParams, setSearchParam, displaySearchOptions } = this.props;
    return (
      <div className="header-main">
        <SearchBox
          setSearchParam={setSearchParam}
          hold={displaySearchOptions}
          searchText={searchParams.text}
          {...this.props}
        />
        <span className="header-profile">DM</span>
        <OptionsMenu {...this.props} />
        <HintsMenu {...this.props} />
      </div>
    );
  }
}

const HintsMenu = props => (
  <TooltipMenu
    class="search-tooltip"
    dismiss={props.toggleSearchHints}
    targetId="headerSearch"
    display={props.displaySearchHints}
  >
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
      <div>
        <SearchSuggestion
          icon="icon-time"
          items={props.hints}
          searchText={props.searchText}
        />
        <SearchSuggestion
          icon="icon-search"
          items={[props.searchText]}
          searchText={props.searchText}
        />

        {props.threads.map((thread, index) => (
          <SearchMail
            key={index}
            preview={thread.get('preview')}
            date={thread.get('date')}
            participants={thread.get('header')}
            searchText={props.searchText}
          />
        ))}
      </div>
    )}
  </TooltipMenu>
);

const SearchMail = props => {
  const previewMatches = replaceMatches(props.searchText, props.preview);
  return (
    <div className="search-mail">
      <i className="icon-mail" />
      <div>
        <div>
          <div>
            <span>{previewMatches}</span>
          </div>
          <div>
            <span>{props.date}</span>
          </div>
        </div>
        <div>
          <span>{props.participants}</span>
        </div>
      </div>
    </div>
  );
};

const OptionsMenu = props => (
  <TooltipMenu
    toLeft={true}
    dismiss={props.toggleSearchOptions}
    targetId="headerSearch"
    display={props.displaySearchOptions}
  >
    <div className="search-options">
      <div>
        <div>
          <span>Search</span>
        </div>
        <select
          onChange={ev => {
            const value = ev.target.value;
            props.setSearchParam('mailbox', value);
          }}
        >
          <option value={-1}>All Mail</option>
          {renderLabels(props.allLabels)}
        </select>
      </div>
      <SearchInputBox
        label="From"
        placeholder="People by name or email address"
        value={props.searchParams.from}
        onChange={ev => {
          const value = ev.target.value;
          props.setSearchParam('from', value);
        }}
      />
      <SearchInputBox
        label="To"
        placeholder="People by name or email address"
        value={props.searchParams.to}
        onChange={ev => {
          const value = ev.target.value;
          props.setSearchParam('to', value);
        }}
      />
      <SearchInputBox
        label="Subject"
        placeholder="Enter a text"
        value={props.searchParams.subject}
        onChange={ev => {
          const value = ev.target.value;
          props.setSearchParam('subject', value);
        }}
      />
      <div className="search-option-last">
        <div>
          <CustomCheckbox
            label="Has attachment"
            status={props.searchParams.hasAttachments}
            onCheck={value => {
              props.setSearchParam('hasAttachments', value);
            }}
          />
        </div>
        <button onClick={props.onSearchThreads}>
          <i className="icon-search" /> SEARCH
        </button>
      </div>
    </div>
  </TooltipMenu>
);

const renderLabels = labels => {
  const labelsView = labels.reduce(function(lbs, label) {
    lbs.push(
      <option key={label.get('id')} value={label.get('id')}>
        {label.get('text')}
      </option>
    );
    return lbs;
  }, []);
  return labelsView;
};

const SearchSuggestion = props => {
  if (props.items.size === 0) {
    return null;
  }
  return (
    <div className="search-recent">
      <i className={props.icon} />
      <ul>
        {props.items.map((item, index) => (
          <li key={index}>{replaceMatches(props.searchText, item)}</li>
        ))}
      </ul>
    </div>
  );
};

const SearchInputBox = props => (
  <div>
    <div>{props.label}</div>
    <input onChange={props.onChange} placeholder={props.placeholder} />
  </div>
);

HintsMenu.propTypes = {
  displaySearchHints: PropTypes.bool,
  errorSuggestions: PropTypes.string,
  hints: PropTypes.object,
  searchText: PropTypes.string,
  threads: PropTypes.object,
  toggleSearchHints: PropTypes.func
};

SearchMail.propTypes = {
  date: PropTypes.string,
  participants: PropTypes.string,
  preview: PropTypes.string,
  searchText: PropTypes.string
};

OptionsMenu.propTypes = {
  allLabels: PropTypes.object,
  displaySearchOptions: PropTypes.bool,
  onSearchThreads: PropTypes.func,
  searchParams: PropTypes.object,
  setSearchParam: PropTypes.func,
  toggleSearchOptions: PropTypes.func
};

SearchSuggestion.propTypes = {
  icon: PropTypes.string,
  items: PropTypes.array,
  searchText: PropTypes.string
};

SearchInputBox.propTypes = {
  label: PropTypes.string,
  onChange: PropTypes.func,
  placeholder: PropTypes.string
};

HeaderMain.propTypes = {
  displaySearchOptions: PropTypes.bool,
  searchParams: PropTypes.object,
  setSearchParam: PropTypes.func
};

export default HeaderMain;
