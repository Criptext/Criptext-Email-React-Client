import React from 'react';
import PropTypes from 'prop-types';
import string from '../lang';
import './searchoptions.scss';

const SearchOptions = props => (
  <div className="search-options">
    <table>
      <tbody>
        <tr>
          <td>
            <span className="search-options-label">{string.header.search}</span>
          </td>
          <td>
            <select
              onChange={ev => {
                const value = ev.target.value;
                props.getSearchParams('labelId', Number(value));
              }}
            >
              <option value={-1}>{string.labelsItems.allmail}</option>
              {renderLabels(props.allLabels)}
            </select>
          </td>
        </tr>
        <SearchOptionRowInput
          label={string.header.search_options.from}
          placeholder={string.header.search_options.from_placeholder}
          value={props.searchParams.from}
          onChange={ev => {
            const value = ev.target.value;
            props.getSearchParams('from', value);
          }}
        />
        <SearchOptionRowInput
          label={string.header.search_options.to}
          placeholder={string.header.search_options.to_placeholder}
          value={props.searchParams.to}
          onChange={ev => {
            const value = ev.target.value;
            props.getSearchParams('to', value);
          }}
        />
        <SearchOptionRowInput
          label={string.header.search_options.subject}
          placeholder={string.header.search_options.subject_placeholder}
          value={props.searchParams.subject}
          onChange={ev => {
            const value = ev.target.value;
            props.getSearchParams('subject', value);
          }}
        />
        <tr>
          <td colSpan={2}>
            <button
              className="button-a button-search"
              onClick={props.onClickSearch}
            >
              <i className="icon-search" />
              <span>{string.header.search}</span>
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
        className="search-options-input"
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
