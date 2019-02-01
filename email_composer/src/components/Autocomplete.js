import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Autosuggest from 'react-autosuggest';
import Suggestion from './Suggestion';

class Autocomplete extends Component {
  render() {
    return (
      <Autosuggest
        ref={input => {
          this.autosuggest = input;
        }}
        suggestions={this.props.suggestions}
        shouldRenderSuggestions={this.props.shouldRenderSuggestions}
        getSuggestionValue={this.props.getSuggestionValue}
        renderSuggestion={Suggestion}
        inputProps={this.props.inputProps}
        onSuggestionSelected={this.props.onSuggestionSelected}
        onSuggestionsClearRequested={this.props.onSuggestionsClearRequested}
        onSuggestionsFetchRequested={this.props.onSuggestionsFetchRequested}
        highlightFirstSuggestion={this.props.suggestionHighlight}
      />
    );
  }

  componentDidMount() {
    const inputName = this.props.inputProps.name;
    setTimeout(() => {
      if (
        inputName === 'To' &&
        this.props.inputProps.isfocuseditorinput === 'false'
      ) {
        this.autosuggest.input.focus();
      }
    }, 500)    
  }
}

Autocomplete.propTypes = {
  getSuggestionValue: PropTypes.func,
  inputProps: PropTypes.object,
  onSuggestionSelected: PropTypes.func,
  onSuggestionsClearRequested: PropTypes.func,
  onSuggestionsFetchRequested: PropTypes.func,
  shouldRenderSuggestions: PropTypes.func,
  suggestions: PropTypes.array,
  suggestionHighlight: PropTypes.bool
};

export default Autocomplete;
