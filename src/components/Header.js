import React from 'react';
import TooltipMenu from './TooltipMenu';
import './threadheader.css';
import CustomCheckbox from './CustomCheckbox';

const Header = props => {
  return (
    <header className="mailbox-header">
      <div className="header-search" id="headerSearch">
        <i className="icon-search" />
        <input onFocus={() => props.toggleSearchHints(true)} />
        <i className="icon-toogle-down" onClick={props.toggleSearchOptions} />
      </div>
      <span className="header-profile">DM</span>
      <OptionsMenu {...props} />
      <HintsMenu {...props} />
    </header>
  );
};

const OptionsMenu = props => (
  <TooltipMenu
    class="search-tooltip"
    dismiss={() => props.toggleSearchHints(false)}
    targetId="headerSearch"
    display={props.displaySearchHints}
  >
    <div>
      <SearchSuggestion
        icon="icon-time"
        items={['Subject Design', 'Subject Design 2']}
      />
      <SearchSuggestion icon="icon-search" items={['Subject Design']} />
      <div className="search-mail">
        <i className="icon-mail" />
        <div>
          <div>
            <div>Design Review - 14/Dec/2017</div>
            <div>10:50</div>
          </div>
          <div>Gianni Carlo</div>
        </div>
      </div>
    </div>
  </TooltipMenu>
);

const HintsMenu = props => (
  <TooltipMenu
    toLeft={true}
    dismiss={() => props.toggleSearchOptions(false)}
    targetId="headerSearch"
    display={props.displaySearchOptions}
  >
    <div className="search-options">
      <div>
        <div>Search</div>
        <select>
          <option value={-1}>All Mail</option>
          {renderLabels(props.allLabels)}
        </select>
      </div>
      <SearchInputFiled
        label="From"
        placeholder="People by name or email address"
      />
      <SearchInputFiled
        label="To"
        placeholder="People by name or email address"
      />
      <SearchInputFiled label="Subject" placeholder="Enter a text" />
      <div className="search-option-last">
        <div>
          <CustomCheckbox
            label="Has attachment"
            onCheck={value => console.log(value)}
          />
        </div>
        <button>
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
    <ul>{props.items.map(item => <li>{item}</li>)}</ul>
  </div>
);

const SearchInputFiled = props => (
  <div>
    <div>{props.label}</div>
    <input placeholder={props.placeholder} />
  </div>
);

export default Header;
