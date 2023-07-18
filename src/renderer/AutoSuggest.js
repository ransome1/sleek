import React, { useState, useEffect, useRef } from 'react';
import Autosuggest from 'react-autosuggest';
import { Chip, TextField, InputAdornment, Button, Avatar } from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleXmark } from '@fortawesome/free-solid-svg-icons';
import './AutoSuggest.scss';

const regex = / [\+@][^ ]*/g;

const AutoSuggest = ({ textFieldRef, setDialogOpen, attributes, textFieldValue, setTextFieldValue, handleAdd }) => {

  const [suggestions, setSuggestions] = useState([]);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const [prefix, setPrefix] = useState(null);
  const [matchPosition, setMatchPosition] = useState({ start: -1, end: -1 });

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
    <div data-todotxt-attribute={prefix} onClick={() => setSelectedSuggestionIndex(isHighlighted ? suggestions.indexOf(suggestion) : -1)} className={isHighlighted ? 'selected' : ''}>
      <Button key={suggestion}>{suggestion}</Button>
    </div>
  );

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

  useEffect(() => {
    //textFieldRef.current?.focus();
    const handleKeyDown = (event) => {
      // Check if the container is visible before handling the keyboard command
      if (suggestions.length > 0) {
        // Handle your keyboard commands here
        if (event.key === 'Enter') {
          // Handle the Enter key press when suggestions are visible
          if (suggestions.length > 0 && selectedSuggestionIndex !== -1) {
            //event.preventDefault();
            // Select the first suggestion or perform any action you want here
            const selectedSuggestion = suggestions[selectedSuggestionIndex];
            handleSuggestionSelected(null, { suggestion: selectedSuggestion });
          }
        } else if (event.key === 'Escape') {
          event.stopPropagation();
          // Handle the Escape key press to clear suggestions
          handleSuggestionsClearRequested();
        }
      } else {
        if (event.key === 'Enter') {
          handleAdd();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown, true);

    return () => {
      document.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [suggestions]);

  useEffect(() => {
    textFieldRef.current?.focus();
  }, []); 

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
    />
  );
};

export default AutoSuggest;
