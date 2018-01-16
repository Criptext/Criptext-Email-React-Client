import React, { Component } from 'react';
import TooltipMenu from './TooltipMenu';
import './threadheader.css';
import CustomCheckbox from './CustomCheckbox';
import SearchBox from './SearchBox'

class Header extends Component{

  render(){
    return (
      <header className="mailbox-header">
        <SearchBox hold={this.props.displaySearchOptions} {...this.props} />
        <span className="header-profile">DM</span>
        <OptionsMenu {...this.props} />
        <HintsMenu {...this.props} />
      </header>
    );
  };

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
        <select>
          <option value={-1}>All Mail</option>
          {renderLabels(props.allLabels)}
        </select>
      </div>
      <SearchInputBox
        label="From"
        placeholder="People by name or email address"
      />
      <SearchInputBox
        label="To"
        placeholder="People by name or email address"
      />
      <SearchInputBox label="Subject" placeholder="Enter a text" />
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
    <ul>{props.items.map((item, index) => <li key={index}>{item}</li>)}</ul>
  </div>
);

const SearchInputBox = props => (
  <div>
    <div>{props.label}</div>
    <input placeholder={props.placeholder} />
  </div>
);

export default Header;
