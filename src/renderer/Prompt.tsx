import React, { useEffect, Fragment } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import { useTranslation } from "react-i18next";

export interface PromptItem {
  headline?: string;
  text?: string;
  button1?: string;
  onButton1?: React.MouseEventHandler<HTMLButtonElement>;
  button2?: string;
  onButton2?: React.MouseEventHandler<HTMLButtonElement>;
}

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
  const onClick = (
    e: React.MouseEvent<HTMLButtonElement>,
    handler?: React.MouseEventHandler<HTMLButtonElement>,
  ): void => {
    if (handler) handler(e);
    setPromptItem(null);
  };

  useEffect(() => {
    if (promptItem) {
      setContextMenu(null);
    }
  }, [promptItem]);

  return (
    <Dialog open={open} onClose={onClose}>
      {promptItem?.headline && <DialogTitle>{promptItem.headline}</DialogTitle>}
      {promptItem?.text && (
        <DialogContent>
          <Fragment>
            <span dangerouslySetInnerHTML={{ __html: promptItem.text }} />
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
