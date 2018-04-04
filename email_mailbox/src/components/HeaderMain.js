import React, { Component } from 'react';
import PropTypes from 'prop-types';
import TooltipMenu from './TooltipMenu';
import CustomCheckbox, { CustomCheckboxStatus } from './CustomCheckbox';
import SearchBox from './SearchBox';
import { replaceMatches } from '../utils/ReactUtils';
import './headermain.css';
import { List } from 'immutable';

class HeaderMain extends Component {
  render() {
    const {
      searchParams,
      setSearchParam,
      displaySearchOptions,
      accountLetters
    } = this.props;
    return (
      <div className="header-main">
        <SearchBox
          setSearchParam={setSearchParam}
          hold={displaySearchOptions}
          searchText={searchParams.text}
          {...this.props}
        />
        <span className="header-profile">{accountLetters}</span>
        <OptionsMenu {...this.props} />
        <HintsMenu onHintClick={this.onHintClick} {...this.props} />
      </div>
    );
  }

  onHintClick = hint => {
    this.props.setSearchParam('text', hint);
    this.props.onTriggerSearch();
  };
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
          onHintClick={props.onHintClick}
        />
        <SearchSuggestion
          icon="icon-search"
          items={List([props.searchText])}
          searchText={props.searchText}
          onHintClick={props.onHintClick}
        />

        {props.threads.map((thread, index) => (
          <SearchMail
            key={index}
            id={thread.get('id')}
            preview={thread.get('preview')}
            date={thread.get('date')}
            participants={thread.get('fromContactName')}
            searchText={props.searchText}
            onSearchSelectThread={props.onSearchSelectThread}
          />
        ))}
      </div>
    )}
  </TooltipMenu>
);

const SearchMail = props => {
  const previewMatches = replaceMatches(props.searchText, props.preview);
  return (
    <div
      onClick={() => {
        props.onSearchSelectThread(props.id);
      }}
      className="search-mail"
    >
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
            props.setSearchParam('labelId', Number(value));
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
            status={CustomCheckboxStatus.fromBoolean(
              props.searchParams.hasAttachments
            )}
            onCheck={value => {
              props.setSearchParam(
                'hasAttachments',
                CustomCheckboxStatus.toBoolean(value)
              );
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
          <li
            onClick={() => {
              props.onHintClick(item);
            }}
            key={index}
          >
            {replaceMatches(props.searchText, item)}
          </li>
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
  toggleSearchHints: PropTypes.func,
  onHintClick: PropTypes.func,
  onSearchSelectThread: PropTypes.func
};

SearchMail.propTypes = {
  date: PropTypes.string,
  id: PropTypes.number,
  participants: PropTypes.string,
  preview: PropTypes.string,
  searchText: PropTypes.string,
  onSearchSelectThread: PropTypes.func
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
  items: PropTypes.object,
  searchText: PropTypes.string
};

SearchInputBox.propTypes = {
  label: PropTypes.string,
  onChange: PropTypes.func,
  placeholder: PropTypes.string
};

HeaderMain.propTypes = {
  accountLetters: PropTypes.string,
  displaySearchOptions: PropTypes.bool,
  onTriggerSearch: PropTypes.func,
  searchParams: PropTypes.object,
  setSearchParam: PropTypes.func
};

export default HeaderMain;
