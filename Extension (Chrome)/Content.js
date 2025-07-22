
const domain = window.location.hostname;

chrome.storage.local.get([domain], (result) => {
  const colors = result[domain];
  if (colors) {
    applyColors(colors.bgColor, colors.textColor, colors.linkColor);
  }
});

function applyColors(bg, text, link) {
  function setStyles() {
    document.body.style.setProperty("background-color", bg, "important");
    document.body.style.setProperty("color", text, "important");

    document.querySelectorAll("*").forEach(el => {
      el.style.setProperty("background-color", bg, "important");
      el.style.setProperty("color", text, "important");
    });

    document.querySelectorAll("a").forEach(a => {
      a.style.setProperty("color", link, "important");
    });

    document.querySelectorAll("iframe").forEach(iframe => {
      try {
        const doc = iframe.contentDocument || iframe.contentWindow.document;
        doc.body.style.setProperty("background-color", bg, "important");
        doc.body.style.setProperty("color", text, "important");
        doc.querySelectorAll("*").forEach(el => {
          el.style.setProperty("background-color", bg, "important");
          el.style.setProperty("color", text, "important");
        });
        doc.querySelectorAll("a").forEach(a => {
          a.style.setProperty("color", link, "important");
        });
      } catch (e) {
        console.warn("Could not access iframe:", e);
      }
    });
  }

  setStyles();

  const observer = new MutationObserver(() => {
    setStyles();
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

  window.colorObserver = observer;
}
