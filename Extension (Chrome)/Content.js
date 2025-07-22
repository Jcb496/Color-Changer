chrome.storage.local.get(["bgColor", "textColor", "linkColor"], ({ bgColor, textColor, linkColor }) => {
  if (bgColor && textColor && linkColor) {
    applyColors(bgColor, textColor, linkColor);
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
  }
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

  // Initial style application
  setStyles();

  // Watch for DOM changes and reapply styles
  const observer = new MutationObserver(() => {
    setStyles();
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}
