// Injects and controls the soft dark theme on chatgpt.com only.
// The actual colors live in styles.css so they are easy to edit.
(function () {
  const STORAGE_KEYS = {
    enabled: "enabled",
    theme: "theme",
    intensity: "intensity"
  };

  const DEFAULT_SETTINGS = {
    enabled: true,
    theme: "soft",
    intensity: 50
  };

  const THEME_IDS = ["deep", "soft", "light", "warm", "gray"];

  const COLOR_PRESETS = {
    deep: {
      0: {
        bg: "#090a0c",
        surface: "#0c0d0f",
        surface2: "#101114",
        sidebar: "#08090b",
        sidebarSelected: "#17181d",
        input: "#101114",
        code: "#0d0e10",
        codeHeader: "#121317",
        border: "#181a20",
        borderSoft: "#14161b",
        text: "#c3c7cf",
        codeText: "#d2d6de",
        textMuted: "#858d99",
        hover: "#191b21",
        accent: "#7890d0"
      },
      50: {
        bg: "#101114",
        surface: "#131417",
        surface2: "#17181c",
        sidebar: "#0f1013",
        sidebarSelected: "#202127",
        input: "#17181c",
        code: "#121316",
        codeHeader: "#18191d",
        border: "#202228",
        borderSoft: "#1b1d23",
        text: "#cbd0d8",
        codeText: "#d9dde4",
        textMuted: "#8f97a3",
        hover: "#202228",
        accent: "#8399d8"
      },
      100: {
        bg: "#1b1c20",
        surface: "#1f2024",
        surface2: "#23252a",
        sidebar: "#18191d",
        sidebarSelected: "#303238",
        input: "#24262b",
        code: "#1e2024",
        codeHeader: "#24262b",
        border: "#2d3037",
        borderSoft: "#272a31",
        text: "#d4d8df",
        codeText: "#e0e4ea",
        textMuted: "#9fa6b1",
        hover: "#2b2e34",
        accent: "#97aae2"
      }
    },
    soft: {
      0: {
        bg: "#141518",
        surface: "#17181b",
        surface2: "#1a1b1f",
        sidebar: "#131417",
        sidebarSelected: "#24252a",
        input: "#18191c",
        code: "#151619",
        codeHeader: "#1a1b1f",
        border: "#202228",
        borderSoft: "#1c1e23",
        text: "#cdd1d8",
        codeText: "#d8dce3",
        textMuted: "#9299a4",
        hover: "#222329",
        accent: "#8298d8"
      },
      50: {
        bg: "#202124",
        surface: "#242529",
        surface2: "#28292d",
        sidebar: "#1d1e21",
        sidebarSelected: "#34363b",
        input: "#28292d",
        code: "#222327",
        codeHeader: "#28292e",
        border: "#30333a",
        borderSoft: "#2a2d33",
        text: "#d3d7dd",
        codeText: "#dce0e6",
        textMuted: "#9fa6b0",
        hover: "#2f3136",
        accent: "#97aae2"
      },
      100: {
        bg: "#303136",
        surface: "#34363b",
        surface2: "#383a40",
        sidebar: "#2a2b30",
        sidebarSelected: "#454850",
        input: "#3a3c42",
        code: "#32343a",
        codeHeader: "#3a3c42",
        border: "#555963",
        borderSoft: "#484c55",
        text: "#e2e5ea",
        codeText: "#eceff4",
        textMuted: "#bac0ca",
        hover: "#42454d",
        accent: "#adbcf0"
      }
    },
    light: {
      0: {
        bg: "#2b2c31",
        surface: "#303136",
        surface2: "#34363c",
        sidebar: "#27282d",
        sidebarSelected: "#41444c",
        input: "#36383f",
        code: "#303238",
        codeHeader: "#373940",
        border: "#4c515b",
        borderSoft: "#424750",
        text: "#dde1e7",
        codeText: "#e7ebf1",
        textMuted: "#b3bac4",
        hover: "#3e424a",
        accent: "#a4b6ee"
      },
      50: {
        bg: "#383a40",
        surface: "#3e4148",
        surface2: "#454850",
        sidebar: "#32343a",
        sidebarSelected: "#555a65",
        input: "#4a4e57",
        code: "#40434b",
        codeHeader: "#4a4e57",
        border: "#666c78",
        borderSoft: "#575d68",
        text: "#e4e7ec",
        codeText: "#eef1f5",
        textMuted: "#c0c6d0",
        hover: "#50545e",
        accent: "#adbcf0"
      },
      100: {
        bg: "#44474f",
        surface: "#4c5059",
        surface2: "#555a64",
        sidebar: "#3d4048",
        sidebarSelected: "#646a76",
        input: "#5b606b",
        code: "#50545e",
        codeHeader: "#5b606b",
        border: "#777e8c",
        borderSoft: "#69707d",
        text: "#eceff3",
        codeText: "#f3f5f8",
        textMuted: "#ccd2db",
        hover: "#616774",
        accent: "#becaf4"
      }
    },
    gray: {
      0: {
        bg: "#151617",
        surface: "#18191b",
        surface2: "#1c1d20",
        sidebar: "#141516",
        sidebarSelected: "#242629",
        input: "#1c1e22",
        code: "#181a1d",
        codeHeader: "#1e2024",
        border: "#24272c",
        borderSoft: "#1f2226",
        text: "#cdd0d5",
        codeText: "#dadedf",
        textMuted: "#949aa3",
        hover: "#25282d",
        accent: "#7f9ab8"
      },
      50: {
        bg: "#242526",
        surface: "#282a2c",
        surface2: "#2e3033",
        sidebar: "#222325",
        sidebarSelected: "#303236",
        input: "#31343a",
        code: "#2b2d30",
        codeHeader: "#303236",
        border: "#3a3d43",
        borderSoft: "#33363b",
        text: "#d9dce0",
        codeText: "#e0e2e5",
        textMuted: "#abb1b9",
        hover: "#36393e",
        accent: "#9ab4d0"
      },
      100: {
        bg: "#333537",
        surface: "#393b3f",
        surface2: "#404348",
        sidebar: "#2f3134",
        sidebarSelected: "#4a4e56",
        input: "#454850",
        code: "#3b3e44",
        codeHeader: "#44474e",
        border: "#5b606a",
        borderSoft: "#50555e",
        text: "#e5e7ea",
        codeText: "#eef0f3",
        textMuted: "#c2c7ce",
        hover: "#4d5159",
        accent: "#b4cae0"
      }
    },
    warm: {
      0: {
        bg: "#161411",
        surface: "#1a1714",
        surface2: "#1f1b18",
        sidebar: "#141310",
        sidebarSelected: "#28231f",
        input: "#211d19",
        code: "#1a1714",
        codeHeader: "#211d19",
        border: "#2a251f",
        borderSoft: "#24201b",
        text: "#d4ccc2",
        codeText: "#e1d8ce",
        textMuted: "#9f958c",
        hover: "#2d2823",
        accent: "#b98f58"
      },
      50: {
        bg: "#252320",
        surface: "#2a2724",
        surface2: "#302c28",
        sidebar: "#22201e",
        sidebarSelected: "#302c28",
        input: "#34302b",
        code: "#2d2925",
        codeHeader: "#332e29",
        border: "#3b362f",
        borderSoft: "#332f2a",
        text: "#ded7ce",
        codeText: "#e6ded4",
        textMuted: "#b9afa5",
        hover: "#38332e",
        accent: "#d0aa76"
      },
      100: {
        bg: "#37332e",
        surface: "#403b35",
        surface2: "#49433c",
        sidebar: "#322f2a",
        sidebarSelected: "#504941",
        input: "#524b43",
        code: "#454039",
        codeHeader: "#504941",
        border: "#62594e",
        borderSoft: "#554d44",
        text: "#ece5dd",
        codeText: "#f3ece3",
        textMuted: "#d0c5bb",
        hover: "#575047",
        accent: "#dfbd8d"
      }
    }
  };

  const THEME_VARIABLES = [
    "--cgpt-bg",
    "--cgpt-surface",
    "--cgpt-surface-2",
    "--cgpt-sidebar",
    "--cgpt-sidebar-selected",
    "--cgpt-input",
    "--cgpt-code",
    "--cgpt-code-header",
    "--cgpt-border",
    "--cgpt-border-soft",
    "--cgpt-text",
    "--cgpt-code-text",
    "--cgpt-text-muted",
    "--cgpt-hover",
    "--cgpt-accent",
    "--cgpt-intensity-lighten",
    "--cgpt-intensity-darken",
    "--cgpt-intensity-border-lighten",
    "--cgpt-intensity-border-darken",
    "--cgpt-intensity-text-lighten",
    "--cgpt-intensity-text-darken",
    "--cgpt-intensity-muted-lighten",
    "--cgpt-intensity-muted-darken"
  ];

  const ROOT_ENABLED_ATTR = "data-chatgpt-soft-dark-enabled";
  const ROOT_THEME_ATTR = "data-chatgpt-soft-dark-theme";
  const STYLE_LINK_ID = "chatgpt-soft-dark-theme-css";
  const THEME_COLOR_ID = "chatgpt-soft-dark-theme-color";
  let cachedSettings = { ...DEFAULT_SETTINGS };
  let observerStarted = false;

  function injectStylesheet() {
    if (document.getElementById(STYLE_LINK_ID)) {
      return;
    }

    const link = document.createElement("link");
    link.id = STYLE_LINK_ID;
    link.rel = "stylesheet";
    link.href = chrome.runtime.getURL("styles.css");

    // document_start can run before <head> exists, so fall back to <html>.
    const parent = document.head || document.documentElement;
    parent.appendChild(link);
  }

  function clampIntensity(value) {
    const number = Number(value);

    if (!Number.isFinite(number)) {
      return DEFAULT_SETTINGS.intensity;
    }

    return Math.min(100, Math.max(0, Math.round(number)));
  }

  function normalizeSettings(settings) {
    return {
      enabled: settings.enabled !== false,
      theme: THEME_IDS.includes(settings.theme)
        ? settings.theme
        : DEFAULT_SETTINGS.theme,
      intensity: clampIntensity(settings.intensity)
    };
  }

  function hexToRgb(hex) {
    const clean = hex.replace("#", "");
    const value = Number.parseInt(clean, 16);

    return {
      r: (value >> 16) & 255,
      g: (value >> 8) & 255,
      b: value & 255
    };
  }

  function rgbToHex({ r, g, b }) {
    return `#${[r, g, b]
      .map((channel) => Math.round(channel).toString(16).padStart(2, "0"))
      .join("")}`;
  }

  function mix(hex, targetHex, amount) {
    const source = hexToRgb(hex);
    const target = hexToRgb(targetHex);

    return rgbToHex({
      r: source.r + (target.r - source.r) * amount,
      g: source.g + (target.g - source.g) * amount,
      b: source.b + (target.b - source.b) * amount
    });
  }

  function interpolateScale(scale, key, intensity) {
    if (intensity <= 50) {
      return mix(scale[0][key], scale[50][key], intensity / 50);
    }

    return mix(scale[50][key], scale[100][key], (intensity - 50) / 50);
  }

  function buildThemeVariables(theme, intensity) {
    const scale = COLOR_PRESETS[theme] || COLOR_PRESETS[DEFAULT_SETTINGS.theme];

    return {
      "--cgpt-bg": interpolateScale(scale, "bg", intensity),
      "--cgpt-surface": interpolateScale(scale, "surface", intensity),
      "--cgpt-surface-2": interpolateScale(scale, "surface2", intensity),
      "--cgpt-sidebar": interpolateScale(scale, "sidebar", intensity),
      "--cgpt-sidebar-selected": interpolateScale(scale, "sidebarSelected", intensity),
      "--cgpt-input": interpolateScale(scale, "input", intensity),
      "--cgpt-code": interpolateScale(scale, "code", intensity),
      "--cgpt-code-header": interpolateScale(scale, "codeHeader", intensity),
      "--cgpt-border": interpolateScale(scale, "border", intensity),
      "--cgpt-border-soft": interpolateScale(scale, "borderSoft", intensity),
      "--cgpt-text": interpolateScale(scale, "text", intensity),
      "--cgpt-code-text": interpolateScale(scale, "codeText", intensity),
      "--cgpt-text-muted": interpolateScale(scale, "textMuted", intensity),
      "--cgpt-hover": interpolateScale(scale, "hover", intensity),
      "--cgpt-accent": interpolateScale(scale, "accent", intensity)
    };
  }

  function setThemeColor(enabled, bgColor = "#202124") {
    let meta = document.getElementById(THEME_COLOR_ID);

    if (!enabled) {
      if (meta) {
        meta.remove();
      }
      return;
    }

    if (!meta) {
      meta = document.createElement("meta");
      meta.id = THEME_COLOR_ID;
      meta.name = "theme-color";
      (document.head || document.documentElement).appendChild(meta);
    }

    meta.content = bgColor;
  }

  function clearThemeVariables(root) {
    THEME_VARIABLES.forEach((name) => {
      root.style.removeProperty(name);
    });
  }

  function setThemeVariables(root, theme, intensity) {
    const variables = buildThemeVariables(theme, intensity);

    Object.entries(variables).forEach(([name, value]) => {
      root.style.setProperty(name, value);
    });

    return variables;
  }

  function applySettings(settings) {
    const normalized = normalizeSettings(settings);
    const root = document.documentElement;
    const intensityOffset = normalized.intensity - DEFAULT_SETTINGS.intensity;
    const lighten = Math.max(0, intensityOffset) * 0.14;
    const darken = Math.max(0, -intensityOffset) * 0.16;
    const borderLighten = lighten * 0.7;
    const borderDarken = darken * 0.6;
    const textLighten = lighten * 0.25;
    const textDarken = darken * 0.28;
    const mutedLighten = lighten * 0.18;
    const mutedDarken = darken * 0.3;

    cachedSettings = normalized;
    if (normalized.enabled) {
      injectStylesheet();
      root.setAttribute(ROOT_ENABLED_ATTR, "true");
      root.setAttribute(ROOT_THEME_ATTR, normalized.theme);
      const variables = setThemeVariables(root, normalized.theme, normalized.intensity);
      console.log("[ChatGPT Soft Dark] applyTheme", {
        enabled: normalized.enabled,
        preset: normalized.theme,
        intensity: normalized.intensity,
        colors: variables
      });
      root.style.setProperty("--cgpt-intensity-lighten", `${lighten.toFixed(2)}%`);
      root.style.setProperty("--cgpt-intensity-darken", `${darken.toFixed(2)}%`);
      root.style.setProperty("--cgpt-intensity-border-lighten", `${borderLighten.toFixed(2)}%`);
      root.style.setProperty("--cgpt-intensity-border-darken", `${borderDarken.toFixed(2)}%`);
      root.style.setProperty("--cgpt-intensity-text-lighten", `${textLighten.toFixed(2)}%`);
      root.style.setProperty("--cgpt-intensity-text-darken", `${textDarken.toFixed(2)}%`);
      root.style.setProperty("--cgpt-intensity-muted-lighten", `${mutedLighten.toFixed(2)}%`);
      root.style.setProperty("--cgpt-intensity-muted-darken", `${mutedDarken.toFixed(2)}%`);
      setThemeColor(true, variables["--cgpt-bg"]);
    } else {
      console.log("[ChatGPT Soft Dark] applyTheme", {
        enabled: normalized.enabled,
        preset: normalized.theme,
        intensity: normalized.intensity,
        colors: "disabled"
      });
      root.removeAttribute(ROOT_ENABLED_ATTR);
      root.removeAttribute(ROOT_THEME_ATTR);
      clearThemeVariables(root);
      setThemeColor(false);
    }
  }

  function readSettings() {
    chrome.storage.local.get(DEFAULT_SETTINGS, (settings) => {
      if (chrome.runtime.lastError) {
        applySettings(DEFAULT_SETTINGS);
        return;
      }

      applySettings(settings);
    });
  }

  // ChatGPT is a single-page app, so reapply cached root attributes after DOM changes.
  function watchDynamicChanges() {
    if (observerStarted) {
      return;
    }

    observerStarted = true;
    let timer = 0;

    const observer = new MutationObserver(() => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => applySettings(cachedSettings), 200);
    });

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true
    });
  }

  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName !== "local") {
      return;
    }

    if (
      changes[STORAGE_KEYS.enabled] ||
      changes[STORAGE_KEYS.theme] ||
      changes[STORAGE_KEYS.intensity]
    ) {
      applySettings({
        enabled: changes[STORAGE_KEYS.enabled]?.newValue ?? cachedSettings.enabled,
        theme: changes[STORAGE_KEYS.theme]?.newValue ?? cachedSettings.theme,
        intensity: changes[STORAGE_KEYS.intensity]?.newValue ?? cachedSettings.intensity
      });
    }
  });

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message?.type !== "THEME_UPDATED") {
      return false;
    }

    console.log("[ChatGPT Soft Dark] THEME_UPDATED received");
    readSettings();
    sendResponse({ ok: true });
    return true;
  });

  injectStylesheet();
  readSettings();

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", watchDynamicChanges, { once: true });
  } else {
    watchDynamicChanges();
  }
})();
