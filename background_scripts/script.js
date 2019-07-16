browser.runtime.onMessage.addListener((action, sender) => {
  if (action === 'show') {
    browser.pageAction.show(sender.tab.id);
  }
});
