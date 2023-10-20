import React, { useState, useEffect, useRef } from 'react';
import Autosuggest from 'react-autosuggest';
import { Button, Avatar, Box, TextField, InputAdornment, IconButton } from '@mui/material';
import OpenInFullIcon from '@mui/icons-material/OpenInFull';
import CloseFullscreenIcon from '@mui/icons-material/CloseFullscreen';
import './AutoSuggest.scss';

const { store } = window.api;

//const regex = / [\+@][^ ]*/g;
const regex = /(?<=^| )[\+@][^ ]*/g;
//const regex = /[@+]/g;

const AutoSuggest = ({ 
  setDialogOpen,
  textFieldValue,
  setTextFieldValue,
  attributes,
  handleAdd,
  todoObject
}) => {
  const [suggestions, setSuggestions] = useState([]);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const [prefix, setPrefix] = useState(null);
  const [matchPosition, setMatchPosition] = useState({ start: -1, end: -1 });
  const [multilineTextField, setMultilineTextField] = useState(store.get('multilineTextField', false));
  const textFieldRef = useRef(null);

  const handleSetMultilineTextField = () => {
    setMultilineTextField(prevMultilineTextField => !prevMultilineTextField);
  };

  const handleSuggestionsFetchRequested = ({ value }) => {
    let content = value.replaceAll('\n', ' ').replaceAll(String.fromCharCode(16), ' ');

    if (!content) return;
    const cursorPosition = textFieldRef.current?.selectionStart;
    if (!cursorPosition) return;

    setSuggestions([]);

    let match;
    while ((match = regex.exec(content)) !== null) {
      const matchValue = match[0];
      const matchStart = match.index;
      const matchEnd = matchStart + matchValue.length;

      if (cursorPosition >= matchStart && cursorPosition <= matchEnd) {
        const suggestions = getSuggestions(matchValue.substr(0, 1), matchValue.substr(1));
        setSuggestions(suggestions);
        setMatchPosition({ start: matchStart, end: matchEnd });
      }
    }
  };

  const handleSuggestionSelected = (_, { suggestion }) => {
    const inputValue = textFieldValue;
    if (!textFieldValue) return;
    const createNewValue = (string, a, b) => {
      return `${textFieldValue.slice(0, a)}${prefix}${string} ${textFieldValue.slice(b + 1)}`;
    };
    const newValue = createNewValue(suggestion, matchPosition.start, matchPosition.end);
    setTextFieldValue(newValue)
    setSuggestions([]);
  };

  const handleChange = (event) => {
    const newValue = event.target.value;
    setTextFieldValue(newValue);
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

  const handleSuggestionsClearRequested = () => {
    setSuggestions([]);
  };

  const containerStyle = {
    width: textFieldRef?.current?.offsetWidth || 'auto',
  };

  const handleKeyDown = (event, id, string) => {
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
      if ((multilineTextField && (event.metaKey || event.ctrlKey) && event.key === 'Enter') || (!multilineTextField && event.key === 'Enter')) {
        event.stopPropagation();
        handleAdd(event, id, string);
      } else if (event.key === 'Escape') {
        event.stopPropagation();
        setDialogOpen(false);
        handleSuggestionsClearRequested();
      }
    }
  };

  const value = () => {
    const value = (multilineTextField) 
      ? textFieldValue.replaceAll(String.fromCharCode(16), '\n') 
      : textFieldValue.replaceAll('\n', String.fromCharCode(16));
    return value;
  }

  const inputProps = {
    placeholder: `(A) text +project @context due:2020-12-12 t:2021-01-10 rec:d pm:1`,
    value: value(),
    onChange: handleChange,
    inputRef: textFieldRef,
    onKeyDown: (event) => handleKeyDown(event, todoObject?.id, textFieldValue),
  };

  useEffect(() => {
    store.set('multilineTextField', multilineTextField);
    textFieldRef.current?.focus();
  }, [multilineTextField]);  

  useEffect(() => {
    textFieldRef.current?.focus();
  }, [textFieldValue]);

  return (
    <>
      <Autosuggest
        renderInputComponent={(inputProps) => (
          multilineTextField ? (
            <TextField
              {...inputProps}
              multiline
              className="input"
            />
          ) : (
            <TextField
              {...inputProps}
              className="input"
            />
          )
        )}
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
      <InputAdornment className="resize" position="end">
        <IconButton onClick={handleSetMultilineTextField}>
          {multilineTextField ? <CloseFullscreenIcon /> : <OpenInFullIcon />}
        </IconButton>
      </InputAdornment>
    </>      
  );
};

export default AutoSuggest;