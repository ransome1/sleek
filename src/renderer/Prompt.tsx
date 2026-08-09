import React, { useEffect, Fragment, useState, useRef } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import { useTranslation } from "react-i18next";
import { ContextMenu, PromptItem } from "@sleek-types";

interface PromptComponentProps {
  open: boolean;
  onClose: () => void;
  promptItem: PromptItem | null;
  setPromptItem: React.Dispatch<React.SetStateAction<PromptItem | null>>;
  setContextMenu: React.Dispatch<React.SetStateAction<ContextMenu | null>>;
}

const PromptComponent: React.FC<PromptComponentProps> = ({
  open,
  onClose,
  promptItem,
  setPromptItem,
  setContextMenu,
}) => {
  const { t } = useTranslation();
  const [inputValue, setInputValue] = useState<string>("");

  const inputRef = useRef<HTMLInputElement>(null);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter" || event.key === "Return") {
      event.preventDefault();
      event.stopPropagation();

      const buttonToTrigger = promptItem?.enterKeyTriggersButton ?? 1;
      const handler =
        buttonToTrigger === 1 ? promptItem?.onButton1 : promptItem?.onButton2;

      if (!handler) return;

      if (promptItem?.input?.validate) {
        const validationResult = promptItem.input.validate(inputValue);
        if (validationResult !== true) {
          promptItem.input?.onValidationError?.(validationResult);
          return;
        }
      }

      handler(inputValue);
      setPromptItem(null);
    }
  };

  const onClick = (
    _: React.MouseEvent<HTMLButtonElement>,
    handler?: (inputValue?: string) => void,
  ): void => {
    if (handler) {
      if (promptItem?.input?.validate) {
        const validationResult = promptItem.input.validate(inputValue);
        if (validationResult !== true) {
          promptItem.input?.onValidationError?.(validationResult);
          return;
        }
      }
      handler(inputValue);
    }
    setPromptItem(null);
  };

  useEffect(() => {
    if (promptItem) {
      setContextMenu(null);
      setInputValue(promptItem.input?.defaultValue || "");

      // Focus the input field after state is updated
      setTimeout(() => {
        if (inputRef.current) {
          const input = inputRef.current.querySelector("input");
          if (input) {
            input.focus();
            input.select();
          }
        }
      }, 0);
    }
  }, [promptItem]);

  return (
    <Dialog open={open} onClose={onClose} onKeyDown={handleKeyDown}>
      {promptItem?.headline && <DialogTitle>{promptItem.headline}</DialogTitle>}
      {(promptItem?.text || promptItem?.input) && (
        <DialogContent>
          <Fragment>
            {promptItem?.text && (
              <span dangerouslySetInnerHTML={{ __html: promptItem.text }} />
            )}
            {promptItem?.input && (
              <TextField
                ref={inputRef}
                autoFocus
                margin="dense"
                label={promptItem.input.label}
                fullWidth
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
              />
            )}
          </Fragment>
        </DialogContent>
      )}
      <DialogActions>
        <button onClick={onClose} data-testid="prompt-button-cancel">
          {t("cancel")}
        </button>
        {promptItem?.button1 && (
          <button
            onClick={(e) => onClick(e, promptItem.onButton1)}
            data-testid={`prompt-button-${promptItem.button1}`}
          >
            {promptItem.button1}
          </button>
        )}
        {promptItem?.button2 && (
          <button
            onClick={(e) => onClick(e, promptItem.onButton2)}
            data-testid={`prompt-button-${promptItem.button2}`}
          >
            {promptItem.button2}
          </button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default PromptComponent;
