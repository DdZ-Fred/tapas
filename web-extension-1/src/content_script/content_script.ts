import { StationMessage } from '@src/shared';
/**
 * LOADED VIA "manifest.content_scripts"
 *
 *  - Similarly to standard scripts on a page
 *    * Access & Manipulate web-pages
 *    * Loaded into web-pages
 *    * Run in context of web-page
 *  - But Have additional features
 *    * Can make cross-domain requests
 *    * Use a part of the WebExtension APIs
 *    * Exchange messages with their background scripts
 *      (and so can access indirectly all the WebExtensions APIs)
 *
 */

const getCountSentence = (count: number) => `Popup opened ${count} times on this tab`;

const renderTabCount = (count: number) => {
  const bodyEl = document.createElement('body');
  bodyEl.append(getCountSentence(count));
  document.querySelector('body')?.replaceWith(bodyEl);
};

const port = browser.runtime.connect(browser.runtime.id, { name: 'content_script/lifecycle' });

browser.runtime.onMessage.addListener(({ command, tabId, data }: StationMessage) => {
  switch (command) {
    // 1. A TAB WAS CREATED/LOADED OR RELOADED => First render or re-render
    // Received from background-script
    case 'TAB_LOAD_OR_RELOAD_REQUEST_ACKNOWLEDGED': {
      if (typeof data?.count === 'number') {
        renderTabCount(data.count);
      }
      break;
    }
    // 2. ALREADY OPENED TAB & POPUP WAS OPENED => Pass message to background-script
    // - Received from popup
    // - Passed to background-script
    case 'INCREMENT_TAB_POPUP_OPEN_COUNT_REQUEST': {
      browser.runtime.sendMessage({ command, tabId });
      break;
    }
    // 3. ALREADY OPENED TAB & POPUP WAS OPENED => Re-render because of new popup opening
    // Received tab count from background-script
    case 'INCREMENT_TAB_POPUP_OPEN_COUNT_REQUEST_ACKNOWLEDGED': {
      if (data?.count) {
        renderTabCount(data.count);
      }
      break;
    }
    default: {
      break;
    }
  }
});

// perform cleanup here
port.onDisconnect.addListener(() => {
  console.log('cleanup');
});

// First Render
browser.runtime.sendMessage({
  command: 'TAB_LOAD_OR_RELOAD_REQUEST',
  tabId: -1,
} as StationMessage);
