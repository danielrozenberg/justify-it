const displayToastElement = document.getElementById('displayToast');

displayToastElement.addEventListener('change', (event) => {
  browser.storage.sync.set({
    displayToast: event.target.checked,
  });
});

browser.storage.sync.get('displayToast').then((options) => {
  // We perform a strict comparison (===) because we want the checkbox to be
  // marked if the value of displayToast is undefined.
  displayToastElement.checked = (options.displayToast !== false);
});
