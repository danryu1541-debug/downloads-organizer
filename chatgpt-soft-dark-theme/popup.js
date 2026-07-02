// Saves popup settings to chrome.storage.local.
// content.js listens for these changes and updates the page immediately.
const DEFAULT_SETTINGS = {
  enabled: true,
  theme: "soft",
  intensity: 50
};

const THEME_IDS = ["deep", "soft", "light", "warm", "gray"];

const enabledInput = document.getElementById("enabled");
const intensityInput = document.getElementById("intensity");
const intensityLabel = document.getElementById("intensityLabel");
const statusText = document.getElementById("status");
const themeInputs = Array.from(document.querySelectorAll('input[name="theme"]'));

function clampIntensity(value) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return DEFAULT_SETTINGS.intensity;
  }

  return Math.min(100, Math.max(0, Math.round(number)));
}

function setStatus(message) {
  statusText.textContent = message;
  window.clearTimeout(setStatus.timer);
  setStatus.timer = window.setTimeout(() => {
    statusText.textContent = "";
  }, 1400);
}

function notifyActiveChatGptTab(reason) {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (chrome.runtime.lastError) {
      console.log("[ChatGPT Soft Dark] tabs.query failed", chrome.runtime.lastError.message);
      return;
    }

    const activeTab = tabs[0];

    if (!activeTab?.id || !activeTab.url?.startsWith("https://chatgpt.com/")) {
      return;
    }

    chrome.tabs.sendMessage(activeTab.id, { type: "THEME_UPDATED", reason }, (response) => {
      if (chrome.runtime.lastError) {
        console.log("[ChatGPT Soft Dark] sendMessage failed", chrome.runtime.lastError.message);
        return;
      }

      console.log("[ChatGPT Soft Dark] THEME_UPDATED sent", response);
    });
  });
}

function render(settings) {
  enabledInput.checked = settings.enabled !== false;
  const intensity = clampIntensity(settings.intensity);

  const theme = THEME_IDS.includes(settings.theme)
    ? settings.theme
    : DEFAULT_SETTINGS.theme;

  themeInputs.forEach((input) => {
    input.checked = input.value === theme;
  });

  intensityInput.value = String(intensity);
  intensityLabel.textContent = `Intensity: ${intensity}`;
}

function saveSetting(key, value, showStatus = true) {
  chrome.storage.local.set({ [key]: value }, () => {
    if (chrome.runtime.lastError) {
      setStatus("설정을 저장하지 못했습니다.");
      return;
    }

    console.log("[ChatGPT Soft Dark] setting saved", { [key]: value });
    notifyActiveChatGptTab(key);

    if (showStatus) {
      setStatus("설정이 저장되었습니다.");
    }
  });
}

chrome.storage.local.get(DEFAULT_SETTINGS, (settings) => {
  if (chrome.runtime.lastError) {
    render(DEFAULT_SETTINGS);
    return;
  }

  render(settings);
});

enabledInput.addEventListener("change", () => {
  saveSetting("enabled", enabledInput.checked);
});

themeInputs.forEach((input) => {
  input.addEventListener("change", () => {
    if (input.checked) {
      saveSetting("theme", input.value);
    }
  });
});

intensityInput.addEventListener("input", () => {
  const intensity = clampIntensity(intensityInput.value);
  intensityLabel.textContent = `Intensity: ${intensity}`;
  saveSetting("intensity", intensity, false);
});

intensityInput.addEventListener("change", () => {
  const intensity = clampIntensity(intensityInput.value);
  intensityInput.value = String(intensity);
  intensityLabel.textContent = `Intensity: ${intensity}`;
  saveSetting("intensity", intensity);
});
