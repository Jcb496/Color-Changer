// When popup loads, get current colors from the page
window.addEventListener('DOMContentLoaded', () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      func: () => {
        const bodyStyles = window.getComputedStyle(document.body);
        const link = document.querySelector("a");
        const linkColor = link ? window.getComputedStyle(link).color : "#000000";
        return {
          bgColor: bodyStyles.backgroundColor,
          textColor: bodyStyles.color,
          linkColor: linkColor
        };
      }
    }, (results) => {
      if (results && results[0] && results[0].result) {
        const { bgColor, textColor, linkColor } = results[0].result;
        document.getElementById('bgColor').value = rgbToHex(bgColor);
        document.getElementById('textColor').value = rgbToHex(textColor);
        document.getElementById('linkColor').value = rgbToHex(linkColor);
      }
    });
  });
});

// Helper to convert RGB to HEX
function rgbToHex(rgb) {
  const result = rgb.match(/\d+/g);
  if (!result) return "#000000";
  return "#" + result.slice(0, 3).map(x => {
    const hex = parseInt(x).toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  }).join('');
}

document.getElementById('apply').addEventListener('click', () => {
  const bgColor = document.getElementById('bgColor').value;
  const textColor = document.getElementById('textColor').value;
  const linkColor = document.getElementById('linkColor').value;

  // Save colors to Chrome storage
  chrome.storage.local.set({ bgColor, textColor, linkColor });

  // Apply colors to the current tab
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      func: applyColors,
      args: [bgColor, textColor, linkColor]
    });
  });
});

document.getElementById("reset").addEventListener("click", () => {
  // Clear saved colors
  chrome.storage.local.remove(["bgColor", "textColor", "linkColor"], () => {
    console.log("Color settings cleared.");

    // Reset styles on the current tab
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        func: resetColors
      });
    });
  });
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

function resetColors() {
  // Reset body styles
  document.body.style.backgroundColor = "";
  document.body.style.color = "";

  // Reset all elements
  document.querySelectorAll("*").forEach(el => {
    el.style.backgroundColor = "";
    el.style.color = "";
  });

  // Reset link colors
  document.querySelectorAll("a").forEach(a => {
    a.style.color = "";
  });
}
