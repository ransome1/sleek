import React, { useState, useRef, useEffect } from 'react';
import Autosuggest from 'react-autosuggest';
import { Avatar, Chip, TextField } from '@mui/material';
import './AutoSuggest.scss';

const AutoSuggest = ({ todoObject, setDialogOpen, filters }) => {
  const textFieldRef = useRef(null);
  const [textFieldValue, setTextFieldValue] = useState(todoObject?.string || '');
  const [suggestions, setSuggestions] = useState([]);
  const [prefix, setPrefix] = useState(null);
  const regex = / [\+@][^ ]*/g;
  const [matchPosition, setMatchPosition] = useState({ start: -1, end: -1 });


  useEffect(() => {
    textFieldRef.current?.focus();
  });  

  const handleSuggestionsFetchRequested = ({ value, reason }) => {

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

  function handleSuggestionSelected(event, { suggestion }) {

    const inputValue = textFieldRef.current?.value;
    if (!inputValue) return;

    const createNewValue = (string, a, b) => {
      return `${inputValue.slice(0, a)} ${prefix}${string} ${inputValue.slice(b + 1)}`;
    };

    const newValue = createNewValue(suggestion, matchPosition.start, matchPosition.end);


    setTextFieldValue(newValue);
    setSuggestions([]);
  }

  const handleChange = (event, { newValue, method }) => {
    if(method === 'type') setTextFieldValue(newValue);
  };

  const getSuggestions = (trigger, match) => {
    if (trigger === '@') {
      setPrefix('@');
      return Object.keys(filters.contexts).filter(key => key.includes(match));
    } else if (trigger === '+') {
      setPrefix('+');
      return Object.keys(filters.projects).filter(key => key.includes(match));
    }
    return [];
  };

  const renderSuggestion = (suggestion) => (
    <Chip
      variant="outlined"
      data-todotxt-attribute={prefix}
      label={suggestion}
      avatar={<Avatar>{prefix}</Avatar>}
      key={suggestion}
    />
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
    textFieldRef.current?.focus();
  };

  return (
    <Autosuggest
      renderInputComponent={renderInputComponent}
      suggestions={suggestions}
      onSuggestionsFetchRequested={handleSuggestionsFetchRequested}
      onSuggestionsClearRequested={handleSuggestionsClearRequested}
      getSuggestionValue={(suggestion) => suggestion}
      //getSuggestionValue={(suggestion) => handleSuggestionSelected(suggestion, matchPosition)}
      renderSuggestion={(suggestion) => renderSuggestion(suggestion, matchPosition)}
      onSuggestionSelected={handleSuggestionSelected}
      inputProps={inputProps}
    />
  );
};

export default AutoSuggest;
