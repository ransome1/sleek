import React, { useState, useEffect, useRef } from 'react';
import Autosuggest from 'react-autosuggest';
import { TextField, InputAdornment, Button, Avatar, Box } from '@mui/material';
import './AutoSuggest.scss';

const regex = / [\+@][^ ]*/g;

const AutoSuggest = ({ 
  setDialogOpen,
  textFieldRef,
  textFieldValue,
  setTextFieldValue,
  attributes,
  handleAdd
}) => {
  const [suggestions, setSuggestions] = useState([]);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const [prefix, setPrefix] = useState(null);
  const [matchPosition, setMatchPosition] = useState({ start: -1, end: -1 });

  const handleSuggestionsFetchRequested = ({ value }) => {
    const inputValue = value;
    if (!inputValue) return;

    const cursorPosition = textFieldRef.current?.selectionStart;
    if (!cursorPosition) return;

    setSuggestions([]);

    let match;
    while ((match = regex.exec(inputValue)) !== null) {
      const matchValue = match[0];
      const matchStart = match.index;
      const matchEnd = matchStart + matchValue.length;

      if (cursorPosition >= matchStart && cursorPosition <= matchEnd) {
        const suggestions = getSuggestions(matchValue.substr(1, 1), matchValue.substr(2));
        setSuggestions(suggestions);
        setMatchPosition({ start: matchStart, end: matchEnd });
      }
    }
  };

  const handleSuggestionSelected = (_, { suggestion }) => {

    const inputValue = textFieldValue;
    if (!textFieldValue) return;

    const createNewValue = (string, a, b) => {
      return `${textFieldValue.slice(0, a)} ${prefix}${string} ${textFieldValue.slice(b + 1)}`;
    };

    const newValue = createNewValue(suggestion, matchPosition.start, matchPosition.end);

    setTextFieldValue(newValue)
    setSuggestions([]);
  };

  const handleChange = (event, { newValue, method }) => {
    if (method === 'type') setTextFieldValue(newValue);
  };

  const getSuggestions = (trigger, match) => {
    if (trigger === '@') {
      setPrefix('@');
      return Object.keys(attributes.contexts).filter(key => key.includes(match));
    } else if (trigger === '+') {
      setPrefix('+');
      return Object.keys(attributes.projects).filter(key => key.includes(match));
    }
    return [];
  };

  const renderSuggestion = (suggestion, { isHighlighted }) => (
    <Box
      data-todotxt-attribute={prefix === '+' ? 'projects' : prefix === '@' ? 'contexts' : ''}
      onClick={() => setSelectedSuggestionIndex(isHighlighted ? suggestions.indexOf(suggestion) : -1)}
      className={isHighlighted ? 'selected' : ''}
    >
      <Button key={suggestion}>{suggestion}</Button>
    </Box>
  );

  const renderInputComponent = (inputProps) => <TextField {...inputProps} />;

  const handleSuggestionsClearRequested = () => {
    setSuggestions([]);
  };

  const containerStyle = {
    width: textFieldRef?.current?.offsetWidth || 'auto',
  };

  const handleKeyDown = (event) => {
    if (suggestions.length > 0) {
      
      if (event.key === 'Enter') {   
        if (suggestions.length > 0 && selectedSuggestionIndex !== -1) {
          event.stopPropagation();
          const selectedSuggestion = suggestions[selectedSuggestionIndex];
          handleSuggestionSelected(null, { suggestion: selectedSuggestion });
        }
      } else if (event.key === 'Escape') {
        event.stopPropagation();
        handleSuggestionsClearRequested();
      }
    } else {
      if (event.key === 'Enter') {
        event.stopPropagation();
        handleAdd();
      } else if (event.key === 'Escape') {
        event.stopPropagation();
        setDialogOpen(false);
        handleSuggestionsClearRequested();
      }
    }
  };

  const inputProps = {
    placeholder: `(A) text +project @context due:2020-12-12 t:2021-01-10 rec:d pm:1`,
    value: textFieldValue,
    onChange: handleChange,
    inputRef: textFieldRef,
    onKeyDown: handleKeyDown,
  };

  useEffect(() => {
    textFieldRef.current.focus();
  }, []);  

  return (
    <Autosuggest
      renderInputComponent={renderInputComponent}
      renderSuggestionsContainer={({ containerProps, children }) => (
        <Box {...containerProps} style={containerStyle}>
          {children}
        </Box>
      )}
      suggestions={suggestions}
      onSuggestionsFetchRequested={handleSuggestionsFetchRequested}
      onSuggestionsClearRequested={handleSuggestionsClearRequested}
      getSuggestionValue={(suggestion) => suggestion}
      renderSuggestion={renderSuggestion}
      onSuggestionSelected={handleSuggestionSelected}
      inputProps={inputProps}
    />
  );
};

export default AutoSuggest;