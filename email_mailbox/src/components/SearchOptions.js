import React from 'react';
import PropTypes from 'prop-types';
import CustomCheckbox, { CustomCheckboxStatus } from './CustomCheckbox';
import './searchoptions.css';

const SearchOptions = props => (
  <div className="search-options">
    <table>
      <tbody>
        <tr>
          <td>
            <span className="search-options-label">Search</span>
          </td>
          <td>
            <select
              onChange={ev => {
                const value = ev.target.value;
                props.getSearchParams('labelId', Number(value));
              }}
            >
              <option value={-1}>All Mail</option>
              {renderLabels(props.allLabels)}
            </select>
          </td>
        </tr>
        <SearchOptionRowInput
          label="From"
          placeholder="People by name or email address"
          value={props.searchParams.from}
          onChange={ev => {
            const value = ev.target.value;
            props.getSearchParams('from', value);
          }}
        />
        <SearchOptionRowInput
          label="To"
          placeholder="People by name or email address"
          value={props.searchParams.to}
          onChange={ev => {
            const value = ev.target.value;
            props.getSearchParams('to', value);
          }}
        />
        <SearchOptionRowInput
          label="Subject"
          placeholder="Enter a text"
          value={props.searchParams.subject}
          onChange={ev => {
            const value = ev.target.value;
            props.getSearchParams('subject', value);
          }}
        />
        <tr>
          <td colSpan={2}>
            <CustomCheckbox
              label="Has attachment"
              status={CustomCheckboxStatus.fromBoolean(
                props.searchParams.hasAttachments
              )}
              onCheck={value => {
                props.getSearchParams(
                  'hasAttachments',
                  CustomCheckboxStatus.toBoolean(value)
                );
              }}
            />
            <button className="button-a" onClick={() => props.onClickSearch()}>
              <i className="icon-search" />
              <span>Search</span>
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
);

const SearchOptionRowInput = props => (
  <tr>
    <td>
      <span className="search-options-label">{props.label}</span>
    </td>
    <td>
      <input
        type="text"
        onChange={props.onChange}
        placeholder={props.placeholder}
        value={props.value}
      />
    </td>
  </tr>
);

const renderLabels = labels => {
  const labelsView = labels.map((label, index) => (
    <option key={index} value={label.id}>
      {label.text}
    </option>
  ));
  return labelsView;
};

SearchOptionRowInput.propTypes = {
  label: PropTypes.string,
  onChange: PropTypes.func,
  placeholder: PropTypes.string,
  value: PropTypes.string
};

SearchOptions.defaultProps = {
  allLabels: []
};

SearchOptions.propTypes = {
  allLabels: PropTypes.array,
  onClickSearch: PropTypes.func,
  getSearchParams: PropTypes.func,
  searchParams: PropTypes.object
};

export default SearchOptions;
