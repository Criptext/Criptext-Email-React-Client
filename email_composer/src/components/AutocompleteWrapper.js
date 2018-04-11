import React from 'react';
import PropTypes from 'prop-types';
import { getAllContacts } from './../utils/electronInterface';
import Autocomplete from './Autocomplete';

let people = [];

const AutocompleteWrapper = ({ addTag, ...props }) => {
  let inputProps = props;
  const state = {
    filteredSuggestions: []
  };

  const loadSuggestions = async () => {
    people = await getAllContacts();
  };
  loadSuggestions();

  const handleOnChange = (e, { method }) => {
    if (method === 'enter') {
      e.preventDefault();
    } else {
      props.onChange(e);
    }
  };
  inputProps = { ...inputProps, onChange: handleOnChange };

  const inputValue = (props.value && props.value.trim().toLowerCase()) || '';
  const inputLength = inputValue.length;
  const getSuggestions = () => {
    return inputLength === 0
      ? []
      : people.filter(person => {
          return person.name
            ? person.name.toLowerCase().slice(0, inputLength) === inputValue
            : person.email.toLowerCase().slice(0, inputLength) === inputValue;
        });
  };
  state.filteredSuggestions = getSuggestions();

  const getSuggestionValue = suggestion => suggestion.email;

  const onSuggestionsFetchRequested = () => {
    state.filteredSuggestions = getSuggestions();
  };

  const onSuggestionsClearRequested = () => {
    state.filteredSuggestions = [];
  };

  const shouldRenderSuggestions = value => {
    return value && value.trim().length > 0;
  };

  const onSuggestionSelected = (e, { suggestion }) => {
    addTag(suggestion.email);
  };

  return (
    <Autocomplete
      onChange={handleOnChange}
      suggestions={state.filteredSuggestions}
      shouldRenderSuggestions={shouldRenderSuggestions}
      getSuggestionValue={getSuggestionValue}
      inputProps={inputProps}
      onSuggestionSelected={onSuggestionSelected}
      onSuggestionsClearRequested={onSuggestionsClearRequested}
      onSuggestionsFetchRequested={onSuggestionsFetchRequested}
    />
  );
};

AutocompleteWrapper.propTypes = {
  addTag: PropTypes.func,
  onChange: PropTypes.func,
  value: PropTypes.object
};

export default AutocompleteWrapper;
