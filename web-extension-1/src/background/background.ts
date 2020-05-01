/**
 * LOADED VIA "manifest.background.scripts":
 *
 * - Can access all WebExtensions APIs
 * - Long-term state handling
 * - Long-term operations whatever the moment, page/tab or window
 * - Active until disabled/uninstalled
 */
import { StationMessage, BackgroundScriptState } from '@src/shared';

// ────────────────────────────────────────────────────────────────────────────────
//
// ─── STATE MANAGEMENT ───────────────────────────────────────────────────────────
//
// ────────────────────────────────────────────────────────────────────────────────

let state: BackgroundScriptState = {
  countsByTab: {},
};

const CACHE_KEY = 'station_counts';

const updateCache = () => {
  localStorage.setItem(CACHE_KEY, JSON.stringify(state));
};

const actions = {
  initializeTabCount(tabId: number) {
    state = {
      ...state,
      countsByTab: {
        ...state.countsByTab,
        [tabId]: 0,
      },
    };
    updateCache();
  },
  incrementTabCount(tabId: number) {
    if (!state.countsByTab[tabId]) {
      state = {
        ...state,
        countsByTab: {
          ...state.countsByTab,
          [tabId]: 1,
        },
      };
    } else {
      state = {
        ...state,
        countsByTab: {
          ...state.countsByTab,
          [tabId]: state.countsByTab[tabId] + 1,
        },
      };
    }
    updateCache();
  },
  removeTabCount(removedTabId: number) {
    state = {
      ...state,
      countsByTab: Object.entries(state.countsByTab).reduce((acc, [tabId, count]) => {
        if (tabId !== `${removedTabId}`) {
          return {
            ...acc,
            [tabId]: count,
          };
        }
        return acc;
      }, {}),
    };
    updateCache();
  },
};

// ────────────────────────────────────────────────────────────────────────────────
//
// ─── MAIN ───────────────────────────────────────────────────────────────────────
//
// ────────────────────────────────────────────────────────────────────────────────

const setupBackground = async () => {
  // Cache retrieval (if exist) & State initialization
  const cache = localStorage.getItem(CACHE_KEY);
  if (!cache) {
    updateCache();
  } else {
    state = JSON.parse(cache);
  }
  console.log('setup background');
};

browser.runtime.onInstalled.addListener(setupBackground);

// Couldn't confirm if it was actually working
browser.tabs.onRemoved.addListener(tabId => {
  actions.removeTabCount(tabId);
});

browser.runtime.onMessage.addListener(({ command, tabId }: StationMessage, sender) => {
  console.log('Command: ', command, '\n', sender);
  switch (command) {
    /**
     * 1. TAB POPUP WAS OPENED
     *   - Increment tab count in state & cache
     *   - Send acknowledgement message with new count
     */
    case 'INCREMENT_TAB_POPUP_OPEN_COUNT_REQUEST': {
      actions.incrementTabCount(tabId);
      browser.tabs.sendMessage(tabId, {
        command: 'INCREMENT_TAB_POPUP_OPEN_COUNT_REQUEST_ACKNOWLEDGED',
        tabId,
        data: { count: state.countsByTab[tabId] },
      } as StationMessage);
      break;
    }
    /**
     * 2. TAB WAS CREATED, LOADED OR RELOADED
     *   - Initialize tab count to 0 if necessary
     *   - Send acknowledgement message with current count
     */
    case 'TAB_LOAD_OR_RELOAD_REQUEST': {
      const senderTabId = sender.tab?.id;
      if (senderTabId) {
        if (state.countsByTab[senderTabId] === undefined) {
          actions.initializeTabCount(senderTabId);
        }
        browser.tabs.sendMessage(senderTabId, {
          command: 'TAB_LOAD_OR_RELOAD_REQUEST_ACKNOWLEDGED',
          tabId: senderTabId,
          data: { count: state.countsByTab[senderTabId] },
        } as StationMessage);
      }
      break;
    }
    default: {
      break;
    }
  }
});
