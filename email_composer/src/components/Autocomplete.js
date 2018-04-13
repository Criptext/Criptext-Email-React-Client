import React from 'react';
import PropTypes from 'prop-types';
import Autosuggest from 'react-autosuggest';
import Suggestion from './Suggestion';

const Autocomplete = props => {
  return (
    <Autosuggest
      suggestions={props.suggestions}
      shouldRenderSuggestions={props.shouldRenderSuggestions}
      getSuggestionValue={props.getSuggestionValue}
      renderSuggestion={Suggestion}
      inputProps={props.inputProps}
      onSuggestionSelected={props.onSuggestionSelected}
      onSuggestionsClearRequested={props.onSuggestionsClearRequested}
      onSuggestionsFetchRequested={props.onSuggestionsFetchRequested}
    />
  );
};

Autocomplete.propTypes = {
  suggestions: PropTypes.array,
  shouldRenderSuggestions: PropTypes.func,
  getSuggestionValue: PropTypes.func,
  inputProps: PropTypes.object,
  onSuggestionSelected: PropTypes.func,
  onSuggestionsClearRequested: PropTypes.func,
  onSuggestionsFetchRequested: PropTypes.func
};

export default Autocomplete;
