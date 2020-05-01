/**
 * LOADED VIA "manifest.browser_action.default_popup"
 * BUT USING an HTML file: popup.html
 *
 * - Can access all WebExtensions APIs it has permissions for
 * - Loaded every time the popup is shown
 * - Unloaded every time the popup is closed
 */

import { StationMessage } from '@src/shared';

console.log('Popup script');

// 1. Get Active tab Id
browser.tabs
  .query({ active: true, currentWindow: true })
  .then(tabs => {
    const activeTabId = tabs[0].id;
    if (activeTabId) {
      // 2. Send message to background script
      // to acknowledge popup opening on current tab
      browser.tabs.sendMessage(activeTabId, {
        command: 'INCREMENT_TAB_POPUP_OPEN_COUNT_REQUEST',
        tabId: activeTabId,
        data: null,
      } as StationMessage);
    }
  })
  .catch(reason => {
    console.log('[Active Tab Query] Error: ', reason);
  });
