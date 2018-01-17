import React, { Component } from 'react';
import TooltipMenu from './TooltipMenu';
import './threadheader.css';
import CustomCheckbox from './CustomCheckbox';
import SearchBox from './SearchBox';

class Header extends Component {
  render() {
    const { searchParams, setSearchParam, displaySearchOptions } = this.props;
    return (
      <header className="mailbox-header">
        <SearchBox
          setSearchParam={setSearchParam}
          hold={displaySearchOptions}
          searchText={searchParams.text}
          {...this.props}
        />
        <span className="header-profile">DM</span>
        <OptionsMenu {...this.props} />
        <HintsMenu {...this.props} />
      </header>
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
    <div>
      <SearchSuggestion
        icon="icon-time"
        items={['Subject Design', 'Subject Design 2']}
      />
      <SearchSuggestion icon="icon-search" items={['Subject Design']} />
      {props.threads
        ? props.threads.map((thread, index) => (
            <SearchMail
              key={index}
              preview={thread.get('preview')}
              date={thread.get('date')}
              participants={thread.get('header')}
            />
          ))
        : null}
    </div>
  </TooltipMenu>
);

const SearchMail = props => (
  <div className="search-mail">
    <i className="icon-mail" />
    <div>
      <div>
        <div>{props.preview}</div>
        <div>{props.date}</div>
      </div>
      <div>{props.participants}</div>
    </div>
  </div>
);

const OptionsMenu = props => (
  <TooltipMenu
    toLeft={true}
    dismiss={props.toggleSearchOptions}
    targetId="headerSearch"
    display={props.displaySearchOptions}
  >
    <div className="search-options">
      <div>
        <div>Search</div>
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

const SearchSuggestion = props => (
  <div className="search-recent">
    <i className={props.icon} />
    <ul>{props.items.map((item, index) => <li key={index}>{item}</li>)}</ul>
  </div>
);

const SearchInputBox = props => (
  <div>
    <div>{props.label}</div>
    <input onChange={props.onChange} placeholder={props.placeholder} />
  </div>
);

export default Header;
