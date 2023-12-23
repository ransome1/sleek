import React, { useEffect, useState } from 'react';
import Autosuggest from 'react-autosuggest';
import { Box, Button, TextField } from '@mui/material';
import './AutoSuggest.scss';

const { ipcRenderer} = window.api;

const regex: RegExp = /(?<=^| )[+@][^ ]*/g;

interface Props {
  setDialogOpen: (open: boolean) => void;
  textFieldValue: string;
  setTextFieldValue: (value: string) => void;
  attributes: Attributes | null;
  handleAdd: (id: number, string: string) => void;
  textFieldRef: React.RefObject<HTMLInputElement>;
}

const AutoSuggest: React.FC<Props> = ({
   setDialogOpen,
   textFieldValue,
   setTextFieldValue,
   attributes,
   handleAdd,
   textFieldRef,
 }) => {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState<number>(-1);
  const [prefix, setPrefix] = useState<string | null>(null);
  const [matchPosition, setMatchPosition] = useState<{ start: number; end: number }>({ start: -1, end: -1 });

  const handleSuggestionsFetchRequested = ({ value }: { value: string }) => {
    let content = 
      value
        .replaceAll(/\n/g, ' ')
        .replaceAll(String.fromCharCode(16), ' ');
    if(!content) return false;

    const cursorPosition = textFieldRef.current?.selectionStart;
    if(!cursorPosition) return false;

    let match;
    while ((match = regex.exec(content)) !== null) {
      const matchValue = match[0];
      const matchStart = match.index;
      const matchEnd = matchStart + matchValue.length;

      if(cursorPosition >= matchStart && cursorPosition <= matchEnd) {
        const suggestions = getSuggestions(
          matchValue.substring(0, 1),
          matchValue.substring(1)
        );
        setSuggestions(suggestions);
        setMatchPosition({ start: matchStart, end: matchEnd });
      }
    }
  };

  const handleSuggestionSelected = (_event: React.SyntheticEvent, { suggestion }: { suggestion: string }) => {
    if(!textFieldValue || !matchPosition) return;
    const appendix = (textFieldValue.charAt(matchPosition.end) === '\n') ? '\n': ' ';
    const updatedValue = `${textFieldValue.slice(0, matchPosition.start)}${prefix}${suggestion}${appendix}${textFieldValue.slice(matchPosition.end + 1)}`;
    setSuggestions([]);
    setMatchPosition(null);
    setTextFieldValue(updatedValue);
  };

  const handleShouldRenderSuggestions = (reason: string) => {
    return reason !== 'input-focused';
  }

  const getSuggestions = (trigger: string, match: string): string[] => {
    if(trigger === '@') {
      setPrefix('@');
      return Object.keys(attributes?.contexts).filter((key) => key.includes(match));
    } else if(trigger === '+') {
      setPrefix('+');
      return Object.keys(attributes?.projects).filter((key) => key.includes(match));
    }
    return [];
  };

  const handleRenderSuggestion = (suggestion: string, { isHighlighted }: { isHighlighted: boolean }) => (
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

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      ipcRenderer.send('createTodoObject', event.target.value);
      setTextFieldValue(event.target.value);
    } catch(error) {
      console.error(error);
    }
  };  

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if(suggestions.length > 0) {
      if(suggestions.length === 1 || event.key === 'Enter') {
        if(selectedSuggestionIndex !== -1) {
          event.stopPropagation();
          const selectedSuggestion = suggestions[selectedSuggestionIndex];
          handleSuggestionSelected(null, { suggestion: selectedSuggestion });
        }
      } else if(event.key === 'Escape') {
        event.stopPropagation();
        handleSuggestionsClearRequested();
      }
    } else {
      if((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
        event.stopPropagation();
        handleAdd();
      } else if(event.key === 'Escape') {
        event.stopPropagation();
        setDialogOpen(false);
        handleSuggestionsClearRequested();
      }
    }
  };

  const handleSuggestionHighlighted = () => {
    if(suggestions.length === 1) {
      handleSuggestionSelected(null, { suggestion: suggestions[0] });
    }
  }

  const inputProps: InputProps = {
    placeholder: `(A) text +project @context due:2020-12-12 t:2021-01-10 rec:d pm:1`,
    value: (textFieldValue) ? textFieldValue.replaceAll(String.fromCharCode(16), '\n') : '',
    onChange: handleChange,
    inputRef: textFieldRef,
    onKeyDown: (event: React.KeyboardEvent) => handleKeyDown(event, textFieldValue),
  };

  const containerStyle = {
    width: textFieldRef?.current?.offsetWidth || 'auto',
  };

  useEffect(() => {
    textFieldRef.current?.focus();
  }, []);

  return (
    <>
      <Autosuggest
        renderInputComponent={(inputProps: InputProps) => (
          <TextField {...inputProps} multiline className="input" />
        )}
        renderSuggestionsContainer={({ containerProps, children }) => (
          <Box {...containerProps} style={containerStyle}>
            {children}
          </Box>
        )}
        suggestions={suggestions}
        shouldRenderSuggestions={handleShouldRenderSuggestions}
        onSuggestionsFetchRequested={handleSuggestionsFetchRequested}
        onSuggestionsClearRequested={handleSuggestionsClearRequested}
        getSuggestionValue={(suggestion: string) => suggestion}
        renderSuggestion={handleRenderSuggestion}
        onSuggestionSelected={handleSuggestionSelected}
        onSuggestionHighlighted={handleSuggestionHighlighted}
        inputProps={inputProps}
      />
    </>
  );
};

export default AutoSuggest;
