export type StationCommand =
  | 'INCREMENT_TAB_POPUP_OPEN_COUNT_REQUEST'
  | 'INCREMENT_TAB_POPUP_OPEN_COUNT_REQUEST_ACKNOWLEDGED'
  | 'TAB_LOAD_OR_RELOAD_REQUEST'
  | 'TAB_LOAD_OR_RELOAD_REQUEST_ACKNOWLEDGED';

export interface BackgroundScriptState {
  countsByTab: {
    [tabId: number]: number;
  };
}

export interface StationMessage {
  command: StationCommand;
  tabId: number;
  data: null | { count: number };
}
