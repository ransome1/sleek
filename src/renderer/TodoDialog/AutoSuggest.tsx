import React, { useEffect, useRef, useState } from 'react';
import Autosuggest from 'react-autosuggest';
import { Box, Button, TextField } from '@mui/material';
import './AutoSuggest.scss';

const regex: RegExp = /(?<=^| )[+@][^ ]*/g;

interface Props {
  textFieldValue: string;
  setTextFieldValue: (value: string) => void;
  attributes: Attributes | null;
  handleAdd: (id: number, string: string) => void;
}

const AutoSuggest: React.FC<Props> = ({
   textFieldValue,
   setTextFieldValue,
   attributes,
 }) => {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [prefix, setPrefix] = useState<string | null>(null);
  const [matchPosition, setMatchPosition] = useState<{ start: number; end: number }>({ start: -1, end: -1 });
  const textFieldRef = useRef(null);

  const handleSuggestionsFetchRequested = ({ value }: { value: string }) => {
    let content = 
      value
        .replaceAll(/\n/g, ' ')
        .replaceAll(String.fromCharCode(16), ' ');

    const cursorPosition = textFieldRef.current?.selectionStart;
    if(!cursorPosition) {
      setSuggestions([]);
    }

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
  };

  const handleRenderSuggestion = (suggestion: string, { isHighlighted }: { isHighlighted: boolean }) => (
    <Box
      data-todotxt-attribute={prefix === '+' ? 'projects' : prefix === '@' ? 'contexts' : ''}
      className={isHighlighted ? 'selected' : ''}
    >
      <Button key={suggestion}>{suggestion}</Button>
    </Box>
  );

  const handleSuggestionsClearRequested = () => {
    setSuggestions([]);
  };

  const handleChange = (event, { method }) => {
    try {
      if(method === 'type') {
        setTextFieldValue(event.target.value);
        setSuggestions([]);
      }
    } catch(error) {
      console.error(error);
    }
  };

  const handleKeyDown = (event) => {
    try {
      if(suggestions.length > 0 && event.key === 'Tab') {
        event.preventDefault();
      } else if(suggestions.length > 0 && event.key === 'Escape') {
        event.stopPropagation();
        setSuggestions([]);
      }
    } catch(error) {
      console.error(error);
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
    onKeyDown: handleKeyDown,
  };

  const containerStyle = {
    width: textFieldRef?.current?.offsetWidth +28 || 'auto',
  };

  useEffect(() => {
    textFieldRef.current?.focus();
  }, [textFieldRef]);

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
