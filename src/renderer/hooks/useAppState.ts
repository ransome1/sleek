import { SnackbarState, SnackbarAction } from "../../@types";

export const initialSnackbarState: SnackbarState = {
  open: false,
  content: null,
  severity: undefined,
};

export function snackbarReducer(
  state: SnackbarState,
  action: SnackbarAction,
): SnackbarState {
  switch (action.type) {
    case "show":
      return {
        open: true,
        content: action.content,
        severity: action.severity,
      };
    case "close":
      return {
        open: false,
        content: null,
        severity: undefined,
      };
    default:
      return state;
  }
}
