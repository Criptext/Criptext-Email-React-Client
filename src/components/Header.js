import React from 'react';
import TooltipMenu from './TooltipMenu'
import './threadheader.css';
import CustomCheckbox from './CustomCheckbox'

const Header = props => {
  
  return (<header className='mailbox-header'>
    <div className='header-search' id='headerSearch'>
      <i className='icon-search'>
      </i>
      <input onFocus={() => props.toggleSearchHints(true) } />
      <i className='icon-toogle-down' onClick={props.toggleSearchOptions}>
      </i>
    </div>
    <div className='header-profile'>
      DM
    </div>
    <TooltipMenu class='search-tooltip' dismiss={()=> props.toggleSearchHints(false)} targetId="headerSearch" display={props.displaySearchHints}>
      <div>
        <div className='search-recent'>
          <i className='icon-time'></i>
          <ul>
            <li>
              Subject Design
            </li>
            <li>
              Subject Design 2
            </li>
          </ul>
        </div>
        <div className='search-recent'>
          <i className='icon-search'></i>
          <ul>
            <li>
              Subject Design
            </li>
          </ul>
        </div>
        <div className='search-mail'>
          <i className='icon-mail'></i>
          <div>
            <div>
              <div>
                Design Review - 14/Dec/2017
              </div>
              <div>
                10:50
              </div>
            </div>
            <div>
              Gianni Carlo
            </div>
          </div>
        </div>
      </div>
    </TooltipMenu>
    <TooltipMenu toLeft={true} dismiss={()=> props.toggleSearchOptions(false)} targetId="headerSearch" display={props.displaySearchOptions}>
      <div className="search-options">
        <div>
          <div>
            Search
          </div>
          <select>
            <option value={-1}>All Mail</option>
            {renderLabels(props.allLabels)}
          </select>
        </div>
        <div>
          <div>
            From
          </div>
          <input placeholder="People by name or email address" />
        </div>
        <div>
          <div>
            To
          </div>
          <input placeholder="People by name or email address" />
        </div>
        <div>
          <div>
            Subject
          </div>
          <input placeholder="Enter a text" />
        </div>
        <div className='search-option-last'>
          <div>
            <CustomCheckbox label="Has attachment" onCheck={(value)=>(console.log(value))} />
          </div>
          <button>
            <i className="icon-search"></i> SEARCH
          </button>
        </div>
      </div>
    </TooltipMenu>
  </header>);
};

const renderLabels = labels => {
  const labelsView = labels.reduce( function(lbs, label){
    lbs.push(<option key={label.get('id')} value={label.get('id')}>{label.get('text')}</option>)
    return lbs;
  }, [])
  return labelsView;
}

export default Header;