import React from 'react';
import PropTypes from 'prop-types';
import { getAllContacts } from './../utils/ipc';
import Autocomplete from './Autocomplete';
import { appDomain } from '../utils/const';
import { contactsRegex } from '../utils/RegexUtils';

let people = undefined;
let filtered = [];
let isConsulting = false;
let lastTextValue = '';
const autocompleteCharacters = [',', ';'];

const AutocompleteWrapper = ({ addTag, ...props }) => {
  let inputProps = props;
  let state = {
    filteredSuggestions: [],
    suggestionHighlight: true
  };

  const loadSuggestions = async () => {
    if (!people && !isConsulting) {
      isConsulting = true;
      people = await getAllContacts({});
      isConsulting = !people;
    }
  };
  loadSuggestions();

  const handleOnChange = (e, { newValue, method }) => {
    if (method === 'enter') {
      e.preventDefault();
    } else {
      if (method === 'type') {
        const lastChar = newValue.slice(-1);
        const index = autocompleteCharacters.indexOf(lastChar);
        if (index > -1) {
          const [userValue] = newValue.split(lastChar);
          if (userValue !== '') {
            e.preventDefault();
            const autocompletedAddress =
              userValue.indexOf(appDomain) > -1
                ? userValue
                : `${userValue}@${appDomain}`;
            addTag(autocompletedAddress);
            e.target.value = '';
          }
        }
        state = { ...state, suggestionHighlight: true };
      } else {
        state = { ...state, suggestionHighlight: false };
      }
      props.onChange(e);
    }
  };

  inputProps = { ...inputProps, onChange: handleOnChange };
  const inputValue = (props.value && props.value.trim().toLowerCase()) || '';
  const inputLength = inputValue.length;
  const getSuggestions = () => {
    if (inputLength === 0) return [];
    if (
      lastTextValue.length > inputLength ||
      inputLength === 0 ||
      !filtered.length
    ) {
      filtered = people;
    }
    lastTextValue = inputValue;

    filtered = filtered.filter(person => {
      const emailHasMatches =
        person.email.toLowerCase().slice(0, inputLength) === inputValue;
      const nameHasMatches = person.name
        ? contactsRegex(inputValue).test(person.name)
        : false;
      return emailHasMatches || nameHasMatches;
    });
    return filtered;
  };
  state.filteredSuggestions = getSuggestions();
  const getSuggestionValue = suggestion => suggestion.email;

  const onSuggestionsFetchRequested = () => {
    state.filteredSuggestions = getSuggestions();
  };

  const onSuggestionsClearRequested = () => {
    filtered = [];
    state.filteredSuggestions = [];
  };

  const shouldRenderSuggestions = value => {
    return value && value.trim().length > 0;
  };

  const onSuggestionSelected = (e, { suggestion }) => {
    const { name, email } = suggestion;
    addTag({ name, email });
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
      suggestionHighlight={state.suggestionHighlight}
    />
  );
};

AutocompleteWrapper.propTypes = {
  addTag: PropTypes.func,
  isfocuseditorinput: PropTypes.bool,
  onChange: PropTypes.func,
  value: PropTypes.object
};

export default AutocompleteWrapper;
