import React, { useEffect, useState } from 'react';
import Autosuggest from 'react-autosuggest';
import { Box, Button, IconButton, InputAdornment, TextField } from '@mui/material';
import OpenInFullIcon from '@mui/icons-material/OpenInFull';
import CloseFullscreenIcon from '@mui/icons-material/CloseFullscreen';
import './AutoSuggest.scss';
import { Attributes, TodoObject, InputProps } from '../../main/util';

const { store } = window.api;

const regex = /(?<=^| )[\+@][^ ]*/g;

interface Props {
  setDialogOpen: (open: boolean) => void;
  textFieldValue: string;
  setTextFieldValue: (value: string) => void;
  attributes: Attributes | null;
  handleAdd: (id: number, string: string) => void;
  todoObject: TodoObject | null;
  textFieldRef: React.RefObject<HTMLInputElement>;
}

const AutoSuggest: React.FC<Props> = ({
   setDialogOpen,
   textFieldValue,
   setTextFieldValue,
   attributes,
   handleAdd,
   todoObject,
   textFieldRef,
 }) => {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState<number>(-1);
  const [prefix, setPrefix] = useState<string | null>(null);
  const [matchPosition, setMatchPosition] = useState<{ start: number; end: number }>({ start: -1, end: -1 });
  const [multilineTextField, setMultilineTextField] = useState<boolean>(store.get('multilineTextField'));

  const handleSetMultilineTextField = () => {
    setMultilineTextField((prevMultilineTextField) => !prevMultilineTextField);
  };

  const handleSuggestionsFetchRequested = ({ value }: { value: string }) => {

    let content = value.replaceAll('\n', ' ').replaceAll(String.fromCharCode(16), ' ');
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

  const handleSuggestionSelected = (
    _event: React.SyntheticEvent,
    { suggestion }: { suggestion: string }
  ) => {
    if(!textFieldValue) return;
    const createNewValue = (string: string, a: number, b: number) => {
      return `${textFieldValue.slice(0, a)}${prefix}${string} ${textFieldValue.slice(
        b + 1
      )}`;
    };
    const newValue = createNewValue(
      suggestion,
      matchPosition.start,
      matchPosition.end
    );
    setTextFieldValue(newValue);
    setSuggestions([]);
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    setTextFieldValue(newValue);
  };

  const handleShouldRenderSuggestions = (value, reason) => {
    if(reason === 'input-focused') {
      return false;
    }
    return true;
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

  const handleRenderSuggestion = (
    suggestion: string,
    { isHighlighted }: { isHighlighted: boolean }
  ) => (
    <Box
      data-todotxt-attribute={prefix === '+' ? 'projects' : prefix === '@' ? 'contexts' : ''}
      onClick={() =>
        setSelectedSuggestionIndex(isHighlighted ? suggestions.indexOf(suggestion) : -1)
      }
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

  const handleKeyDown = (
    event: React.KeyboardEvent,
    id: string,
    string: string
  ) => {
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
      if(
        (multilineTextField && (event.metaKey || event.ctrlKey) && event.key === 'Enter') ||
        (!multilineTextField && event.key === 'Enter')
      ) {
        event.stopPropagation();
        handleAdd(id, string);
      } else if(event.key === 'Escape') {
        event.stopPropagation();
        setDialogOpen(false);
        handleSuggestionsClearRequested();
      }
    }
  };

  const handleSuggestionHighlighted = (suggestion) => {
    if(suggestions.length === 1) {
      handleSuggestionSelected(null, { suggestion: suggestions[0] });
    }
  }

  const value = () => {
    return multilineTextField
      ? textFieldValue.replaceAll(String.fromCharCode(16), '\n')
      : textFieldValue.replaceAll('\n', String.fromCharCode(16));
  };

  const inputProps: InputProps = {
    placeholder: `(A) text +project @context due:2020-12-12 t:2021-01-10 rec:d pm:1`,
    value: value(),
    onChange: handleChange,
    inputRef: textFieldRef,
    onKeyDown: (event: React.KeyboardEvent) => handleKeyDown(event, todoObject?.id, textFieldValue),
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
        renderInputComponent={(inputProps: InputProps) =>
          multilineTextField ? (
            <TextField {...inputProps} multiline className="input" />
          ) : (
            <TextField {...inputProps} className="input" />
          )
        }
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
      <InputAdornment className="resize" position="end">
        <IconButton onClick={handleSetMultilineTextField}>
          {multilineTextField ? <CloseFullscreenIcon /> : <OpenInFullIcon />}
        </IconButton>
      </InputAdornment>
    </>
  );
};

export default AutoSuggest;
