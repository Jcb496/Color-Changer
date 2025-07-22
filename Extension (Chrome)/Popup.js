
// Convert RGB to HEX
function rgbToHex(rgb) {
  const result = rgb.match(/\d+/g);
  if (!result) return "#000000";
  return "#" + result.slice(0, 3).map(x => {
    const hex = parseInt(x).toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  }).join('');
}

// Load current page colors when popup opens
window.addEventListener('DOMContentLoaded', () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const url = new URL(tabs[0].url);
    const domain = url.hostname;

    chrome.storage.local.get([domain], (result) => {
      const colors = result[domain];
      if (colors) {
        document.getElementById('bgColor').value = colors.bgColor;
        document.getElementById('textColor').value = colors.textColor;
        document.getElementById('linkColor').value = colors.linkColor;
      }
    });
  });
});

// Apply button logic
document.getElementById('apply').addEventListener('click', () => {
  const bgColor = document.getElementById('bgColor').value;
  const textColor = document.getElementById('textColor').value;
  const linkColor = document.getElementById('linkColor').value;

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const url = new URL(tabs[0].url);
    const domain = url.hostname;

    chrome.storage.local.set({
      [domain]: { bgColor, textColor, linkColor }
    });

    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      func: applyColors,
      args: [bgColor, textColor, linkColor]
    });
  });
});

// Reset button logic
document.getElementById('reset').addEventListener('click', () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const url = new URL(tabs[0].url);
    const domain = url.hostname;

    chrome.storage.local.remove(domain, () => {
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        func: resetColors
      });
    });
  });
});

// Function injected into the page to apply styles
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

  if (window.colorObserver) {
    window.colorObserver.disconnect();
  }

  window.colorObserver = new MutationObserver(() => {
    setStyles();
  });

  window.colorObserver.observe(document.body, {
    childList: true,
    subtree: true
  });
}

// Function injected into the page to reset styles
function resetColors() {
  if (window.colorObserver) {
    window.colorObserver.disconnect();
    window.colorObserver = null;
  }

  document.body.style.backgroundColor = "";
  document.body.style.color = "";

  document.querySelectorAll("*").forEach(el => {
    el.style.backgroundColor = "";
    el.style.color = "";
  });

  document.querySelectorAll("a").forEach(a => {
    a.style.color = "";
  });
}
