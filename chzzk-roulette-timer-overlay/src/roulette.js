const VALID_TARGETS = new Set(["boar", "pig"]);
const VALID_ACTIONS = new Set(["add", "subtract"]);

function normalizeAmount(amount) {
  const number = Number(amount);
  if (!Number.isFinite(number)) return null;
  return String(Math.trunc(number));
}

function validateItem(item) {
  return (
    item &&
    typeof item.label === "string" &&
    Number(item.weight) > 0 &&
    VALID_TARGETS.has(item.target) &&
    VALID_ACTIONS.has(item.action) &&
    Number.isInteger(Number(item.seconds)) &&
    Number(item.seconds) >= 0
  );
}

function findRule(config, amount) {
  const key = normalizeAmount(amount);
  if (!key) return null;
  return config.donationRules?.[key] || null;
}

function drawWeighted(table, random = Math.random) {
  const validItems = table.filter(validateItem).map((item) => ({
    label: item.label,
    weight: Number(item.weight),
    target: item.target,
    action: item.action,
    seconds: Number(item.seconds)
  }));

  const totalWeight = validItems.reduce((sum, item) => sum + item.weight, 0);
  if (totalWeight <= 0) {
    throw new Error("Roulette table has no valid weighted items.");
  }

  let cursor = random() * totalWeight;
  for (const item of validItems) {
    cursor -= item.weight;
    if (cursor < 0) return item;
  }
  return validItems[validItems.length - 1];
}

function rollRule(rule, random = Math.random) {
  const rolls = Math.max(1, Number(rule.rolls) || 1);
  if (!Array.isArray(rule.table)) {
    throw new Error("Roulette rule table must be an array.");
  }

  const results = [];
  for (let index = 0; index < rolls; index += 1) {
    results.push({ index: index + 1, ...drawWeighted(rule.table, random) });
  }
  return results;
}

module.exports = { findRule, normalizeAmount, rollRule };
