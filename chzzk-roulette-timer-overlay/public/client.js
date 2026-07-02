(function () {
  const socket = io();
  const timerNames = { boar: "멧돼지", pig: "돼지" };
  const drawerStorageKey = "rouletteOverlayDrawerOpen";
  let currentConfig = null;

  function formatSeconds(totalSeconds) {
    const safe = Math.max(0, Number(totalSeconds) || 0);
    const hours = Math.floor(safe / 3600);
    const minutes = Math.floor((safe % 3600) / 60);
    const seconds = safe % 60;
    if (hours > 0) {
      return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
    }
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }

  function resultText(entry) {
    if (!entry) return "아직 룰렛 결과가 없습니다.";
    const labels = entry.results.map((result) => result.label).join(" / ");
    return `${Number(entry.amount).toLocaleString("ko-KR")}원 ${entry.results.length}회: ${labels}`;
  }

  function renderTimer(target, timer) {
    const root = document.querySelector(`[data-timer="${target}"]`);
    if (!root || !timer) return;
    const time = root.querySelector("[data-time]");
    const status = root.querySelector("[data-status]");
    if (time) time.textContent = formatSeconds(timer.remainingSeconds);
    if (status) {
      status.textContent = timer.running ? "RUN" : "STOP";
      status.classList.toggle("is-running", timer.running);
    }
  }

  function renderOverlay(state) {
    if (!document.body.classList.contains("overlay-page")) return;
    applyOverlayOptions(state.overlayOptions);
    renderTimer("boar", state.timers?.boar);
    renderTimer("pig", state.timers?.pig);

    const recent = state.recentResults || [];
    const main = document.querySelector("[data-recent-main]");
    const list = document.querySelector("[data-recent-list]");
    if (main) main.textContent = resultText(recent[0]);
    if (list) {
      list.innerHTML = "";
      recent.slice(0, 3).forEach((entry) => {
        const item = document.createElement("li");
        item.textContent = resultText(entry);
        list.appendChild(item);
      });
    }
  }

  function applyOverlayOptions(options = {}) {
    if (!document.body.classList.contains("overlay-page")) return;
    const width = Number(options.width) || 760;
    const height = Number(options.height) || 86;
    const opacity = Math.max(35, Math.min(100, Number(options.opacity) || 92)) / 100;
    const fontScale = Math.max(70, Math.min(140, Number(options.fontScale) || 100)) / 100;
    document.body.style.setProperty("--overlay-width", `${width}px`);
    document.body.style.setProperty("--overlay-height", `${height}px`);
    document.body.style.setProperty("--overlay-alpha", String(opacity));
    document.body.style.setProperty("--font-scale", String(fontScale));

    const drawer = document.querySelector("[data-result-drawer]");
    const toggle = document.querySelector("[data-drawer-toggle]");
    if (drawer && toggle && localStorage.getItem(drawerStorageKey) === null) {
      const open = Boolean(options.showRecentByDefault);
      drawer.classList.toggle("is-collapsed", !open);
      toggle.setAttribute("aria-expanded", String(open));
    }
  }

  function renderAdmin(state) {
    if (!document.body.classList.contains("admin-page")) return;
    renderTimer("boar", state.timers?.boar);
    renderTimer("pig", state.timers?.pig);

    const logs = document.querySelector("[data-admin-logs]");
    if (logs) {
      logs.innerHTML = "";
      (state.recentResults || []).slice(0, 12).forEach((entry) => {
        const item = document.createElement("li");
        const strong = document.createElement("strong");
        const span = document.createElement("span");
        const time = new Date(entry.timestamp).toLocaleTimeString("ko-KR", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit"
        });
        strong.textContent = `${time} ${Number(entry.amount).toLocaleString("ko-KR")}원`;
        span.textContent = entry.results.map((result) => result.label).join(" / ");
        item.append(strong, span);
        logs.appendChild(item);
      });
    }
  }

  function renderOverlayEditor(options = {}) {
    if (!document.body.classList.contains("admin-page")) return;
    const defaults = { width: 760, height: 86, opacity: 92, fontScale: 100, showRecentByDefault: false };
    const next = { ...defaults, ...options };
    const fields = {
      width: document.querySelector("[data-overlay-width]"),
      height: document.querySelector("[data-overlay-height]"),
      opacity: document.querySelector("[data-overlay-opacity]"),
      fontScale: document.querySelector("[data-overlay-font-scale]"),
      showRecentByDefault: document.querySelector("[data-overlay-recent-open]")
    };
    if (!fields.width) return;
    fields.width.value = next.width;
    fields.height.value = next.height;
    fields.opacity.value = next.opacity;
    fields.fontScale.value = next.fontScale;
    fields.showRecentByDefault.checked = Boolean(next.showRecentByDefault);
  }

  function collectOverlayOptions() {
    return {
      width: Number(document.querySelector("[data-overlay-width]")?.value) || 760,
      height: Number(document.querySelector("[data-overlay-height]")?.value) || 86,
      opacity: Number(document.querySelector("[data-overlay-opacity]")?.value) || 92,
      fontScale: Number(document.querySelector("[data-overlay-font-scale]")?.value) || 100,
      showRecentByDefault: Boolean(document.querySelector("[data-overlay-recent-open]")?.checked)
    };
  }

  function setOverlayStatus(message, isError = false) {
    const status = document.querySelector("[data-overlay-status]");
    if (!status) return;
    status.textContent = message;
    status.classList.toggle("is-error", isError);
  }

  async function requestJson(url, options = {}) {
    const response = await fetch(url, {
      headers: { "Content-Type": "application/json", ...(options.headers || {}) },
      ...options
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || data.message || "요청에 실패했습니다.");
    return data;
  }

  function postJson(url, body = {}) {
    return requestJson(url, { method: "POST", body: JSON.stringify(body) });
  }

  function putJson(url, body = {}) {
    return requestJson(url, { method: "PUT", body: JSON.stringify(body) });
  }

  function bindOverlayControls() {
    if (!document.body.classList.contains("overlay-page")) return;

    const drawer = document.querySelector("[data-result-drawer]");
    const toggle = document.querySelector("[data-drawer-toggle]");
    if (!drawer || !toggle) return;

    const setOpen = (open) => {
      drawer.classList.toggle("is-collapsed", !open);
      toggle.setAttribute("aria-expanded", String(open));
      localStorage.setItem(drawerStorageKey, open ? "true" : "false");
    };

    const stored = localStorage.getItem(drawerStorageKey);
    setOpen(stored === null ? false : stored === "true");
    toggle.addEventListener("click", () => {
      setOpen(drawer.classList.contains("is-collapsed"));
    });
  }

  function setConfigStatus(message, isError = false) {
    const status = document.querySelector("[data-config-status]");
    if (!status) return;
    status.textContent = message;
    status.classList.toggle("is-error", isError);
  }

  async function loadConfigEditor() {
    if (!document.body.classList.contains("admin-page")) return;
    try {
      currentConfig = await requestJson("/api/config");
      renderOverlayEditor(currentConfig.overlayOptions);
      renderConfigEditor(currentConfig);
      setConfigStatus("확률표를 불러왔습니다.");
      setOverlayStatus("오버레이 설정을 불러왔습니다.");
    } catch (error) {
      setConfigStatus(error.message, true);
    }
  }

  function renderConfigEditor(config) {
    const list = document.querySelector("[data-rule-list]");
    if (!list) return;
    list.innerHTML = "";

    const entries = Object.entries(config.donationRules || {}).sort((a, b) => Number(a[0]) - Number(b[0]));
    if (entries.length === 0) {
      setConfigStatus("등록된 후원 금액이 없습니다. 금액 추가를 눌러 새 룰렛을 만드세요.");
      return;
    }

    entries.forEach(([amount, rule]) => {
      list.appendChild(createRuleCard(amount, rule));
    });
  }

  function createRuleCard(amount, rule) {
    const template = document.querySelector("#rule-template");
    const card = template.content.firstElementChild.cloneNode(true);
    const amountInput = card.querySelector("[data-rule-amount]");
    const nameInput = card.querySelector("[data-rule-name]");
    const rollsInput = card.querySelector("[data-rule-rolls]");
    const itemList = card.querySelector("[data-item-list]");

    amountInput.value = amount;
    nameInput.value = rule.name || `${amount}원 룰렛`;
    rollsInput.value = rule.rolls || 1;
    (rule.table || []).forEach((item) => itemList.appendChild(createItemRow(item)));
    updateRuleTitle(card);

    card.addEventListener("input", () => updateRuleTitle(card));
    card.querySelector("[data-add-item]").addEventListener("click", () => {
      itemList.appendChild(
        createItemRow({
          label: "멧돼지 +10분",
          weight: 1,
          target: "boar",
          action: "add",
          seconds: 600
        })
      );
      updateRuleTitle(card);
    });
    card.querySelector("[data-save-rule]").addEventListener("click", saveConfigFromEditor);
    card.querySelector("[data-delete-rule]").addEventListener("click", async () => {
      if (!confirm(`${amountInput.value}원 룰렛을 삭제할까요?`)) return;
      card.remove();
      await saveConfigFromEditor();
    });

    return card;
  }

  function createItemRow(item) {
    const template = document.querySelector("#item-template");
    const row = template.content.firstElementChild.cloneNode(true);
    row.querySelector("[data-item-label]").value = item.label || "";
    row.querySelector("[data-item-weight]").value = item.weight || 1;
    row.querySelector("[data-item-target]").value = item.target || "boar";
    row.querySelector("[data-item-action]").value = item.action || "add";
    row.querySelector("[data-item-minutes]").value = Math.round((Number(item.seconds) || 0) / 60);
    row.querySelector("[data-remove-item]").addEventListener("click", () => row.remove());
    return row;
  }

  function updateRuleTitle(card) {
    const amount = card.querySelector("[data-rule-amount]").value || "새 금액";
    const name = card.querySelector("[data-rule-name]").value || "이름 없음";
    const rolls = Number(card.querySelector("[data-rule-rolls]").value || 1);
    const itemCount = card.querySelectorAll("[data-item-row]").length;
    card.querySelector("[data-rule-title]").textContent = `${Number(amount).toLocaleString("ko-KR")}원`;
    card.querySelector("[data-rule-summary]").textContent = `${name} · ${rolls}회 · 항목 ${itemCount}개`;
  }

  function collectConfigFromEditor() {
    const cards = [...document.querySelectorAll("[data-rule-card]")];
    const nextConfig = {
      currency: currentConfig?.currency || "KRW",
      maxRecentResults: currentConfig?.maxRecentResults || 12,
      overlayOptions: collectOverlayOptions(),
      donationRules: {}
    };

    for (const card of cards) {
      const amount = String(Math.trunc(Number(card.querySelector("[data-rule-amount]").value)));
      if (!amount || amount === "NaN" || Number(amount) <= 0) {
        throw new Error("후원 금액은 1원 이상이어야 합니다.");
      }
      if (nextConfig.donationRules[amount]) {
        throw new Error(`${Number(amount).toLocaleString("ko-KR")}원 룰렛이 중복되었습니다.`);
      }

      const rows = [...card.querySelectorAll("[data-item-row]")];
      if (rows.length === 0) {
        throw new Error(`${Number(amount).toLocaleString("ko-KR")}원 룰렛에는 항목이 최소 1개 필요합니다.`);
      }

      nextConfig.donationRules[amount] = {
        name: card.querySelector("[data-rule-name]").value || `${amount}원 룰렛`,
        rolls: Math.max(1, Number(card.querySelector("[data-rule-rolls]").value) || 1),
        table: rows.map((row) => ({
          label: row.querySelector("[data-item-label]").value || "룰렛 결과",
          weight: Math.max(0.01, Number(row.querySelector("[data-item-weight]").value) || 1),
          target: row.querySelector("[data-item-target]").value,
          action: row.querySelector("[data-item-action]").value,
          seconds: Math.max(0, Math.round(Number(row.querySelector("[data-item-minutes]").value) || 0) * 60)
        }))
      };
    }

    return nextConfig;
  }

  async function saveConfigFromEditor() {
    try {
      setConfigStatus("확률표를 저장하는 중입니다.");
      const nextConfig = collectConfigFromEditor();
      currentConfig = await putJson("/api/config", nextConfig);
      renderConfigEditor(currentConfig);
      setConfigStatus("저장했습니다. 테스트 후원으로 바로 확인할 수 있습니다.");
    } catch (error) {
      setConfigStatus(error.message, true);
    }
  }

  async function saveOverlayOptions() {
    try {
      setOverlayStatus("오버레이 설정을 저장하는 중입니다.");
      const nextConfig = {
        ...(currentConfig || {}),
        overlayOptions: collectOverlayOptions(),
        donationRules: currentConfig?.donationRules || {}
      };
      currentConfig = await putJson("/api/config", nextConfig);
      renderOverlayEditor(currentConfig.overlayOptions);
      setOverlayStatus("저장했습니다. 오버레이 페이지에 바로 반영됩니다.");
    } catch (error) {
      setOverlayStatus(error.message, true);
    }
  }

  function bindConfigEditor() {
    if (!document.body.classList.contains("admin-page")) return;
    document.querySelector("[data-save-overlay]")?.addEventListener("click", saveOverlayOptions);
    document.querySelector("[data-add-rule]")?.addEventListener("click", () => {
      const list = document.querySelector("[data-rule-list]");
      const existingAmounts = new Set([...document.querySelectorAll("[data-rule-amount]")].map((input) => input.value));
      let amount = 1000;
      while (existingAmounts.has(String(amount))) amount += 1000;
      list.appendChild(
        createRuleCard(String(amount), {
          name: `${amount}원 룰렛`,
          rolls: 1,
          table: [{ label: "멧돼지 +10분", weight: 1, target: "boar", action: "add", seconds: 600 }]
        })
      );
      setConfigStatus("새 금액을 추가했습니다. 내용을 수정한 뒤 저장하세요.");
    });
    loadConfigEditor();
  }

  function bindAdminControls() {
    if (!document.body.classList.contains("admin-page")) return;

    document.querySelectorAll("[data-command]").forEach((button) => {
      button.addEventListener("click", async () => {
        const target = button.dataset.target;
        const command = button.dataset.command;
        const secondsInput = document.querySelector(`[data-seconds="${target}"]`);
        const seconds = Number(secondsInput?.value || 0) * 60;
        const payload = command === "adjust" ? { seconds } : {};
        try {
          await postJson(`/api/timers/${target}/${command}`, payload);
        } catch (error) {
          alert(error.message);
        }
      });
    });

    document.querySelectorAll("[data-adjust]").forEach((button) => {
      button.addEventListener("click", async () => {
        const target = button.dataset.target;
        const minutes = Number(document.querySelector(`[data-seconds="${target}"]`)?.value || 0);
        const sign = button.dataset.adjust === "subtract" ? -1 : 1;
        try {
          await postJson(`/api/timers/${target}/adjust`, { seconds: sign * minutes * 60 });
        } catch (error) {
          alert(error.message);
        }
      });
    });

    const donationForm = document.querySelector("[data-test-form]");
    donationForm?.addEventListener("submit", async (event) => {
      event.preventDefault();
      const amount = Number(new FormData(donationForm).get("amount"));
      try {
        const result = await postJson("/api/test-donation", { amount });
        const output = document.querySelector("[data-test-output]");
        if (output) output.textContent = result.results.map((item) => item.label).join(" / ");
      } catch (error) {
        alert(error.message);
      }
    });

    document.querySelector("[data-clear-results]")?.addEventListener("click", async () => {
      if (!confirm("최근 룰렛 결과 로그를 모두 지울까요?")) return;
      try {
        await postJson("/api/results/clear");
      } catch (error) {
        alert(error.message);
      }
    });
  }

  socket.on("state", (state) => {
    renderOverlay(state);
    renderAdmin(state);
  });

  window.addEventListener("DOMContentLoaded", () => {
    bindOverlayControls();
    bindAdminControls();
    bindConfigEditor();
  });

  window.RouletteTimer = { formatSeconds, timerNames };
})();
