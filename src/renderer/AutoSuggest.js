import React, { useState, useEffect, useRef } from 'react';
import Autosuggest from 'react-autosuggest';
import { Chip, TextField, InputAdornment, Button, Avatar } from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleXmark } from '@fortawesome/free-solid-svg-icons';
import './AutoSuggest.scss';

const AutoSuggest = ({ textFieldRef, setDialogOpen, attributes, textFieldValue, setTextFieldValue }) => {

  const [suggestions, setSuggestions] = useState([]);
  const [prefix, setPrefix] = useState(null);
  const regex = / [\+@][^ ]*/g;
  const [matchPosition, setMatchPosition] = useState({ start: -1, end: -1 });

  useEffect(() => {
    textFieldRef.current?.focus();
  }, []);

  const handleSuggestionsFetchRequested = ({ value }) => {
    const inputValue = textFieldRef.current?.value;
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
    const inputValue = textFieldRef.current?.value;
    if (!inputValue) return;

    const createNewValue = (string, a, b) => {
      return `${inputValue.slice(0, a)} ${prefix}${string} ${inputValue.slice(b + 1)}`;
    };

    const newValue = createNewValue(suggestion, matchPosition.start, matchPosition.end);

    setTextFieldValue(newValue);
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
    <div data-todotxt-attribute={prefix} className={isHighlighted ? 'selected' : ''}>
      <Button key={suggestion}>{suggestion}</Button>
    </div>
  );

  const handleXClick = () => {
    const newValue = '';
    setTextFieldValue(newValue);
  };

  const inputProps = {
    placeholder: `(A) Todo text +project @context due:2020-12-12 rec:d`,
    value: textFieldValue,
    onChange: handleChange,
    inputRef: textFieldRef,
  };

  const renderInputComponent = (inputProps) => <TextField {...inputProps} />;

  const handleSuggestionsClearRequested = () => {
    setSuggestions([]);
  };

  const containerStyle = {
    width: textFieldRef?.current?.offsetWidth || 'auto',
  }; 

  return (
    <Autosuggest
      renderInputComponent={renderInputComponent}
      renderSuggestionsContainer={({ containerProps, children }) => (
        <div {...containerProps} style={containerStyle}>
          {children}
        </div>
      )}      
      suggestions={suggestions}
      onSuggestionsFetchRequested={handleSuggestionsFetchRequested}
      onSuggestionsClearRequested={handleSuggestionsClearRequested}
      getSuggestionValue={(suggestion) => suggestion}
      renderSuggestion={renderSuggestion}
      onSuggestionSelected={handleSuggestionSelected}
      inputProps={inputProps}
      highlightFirstSuggestion={true}
    />
  );
};

export default AutoSuggest;
