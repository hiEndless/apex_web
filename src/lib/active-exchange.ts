// 中文说明：当前前端用 LocalStorage 维护“激活的交易所”，用于在不同页面之间共享选择状态。
// 约定：该值仅代表用户当前激活的 ExchangeAccount.exchange（如 binance/okx），不包含 API Key 等敏感信息。

const ACTIVE_EXCHANGE_STORAGE_KEY = 'utaker.active_exchange';

export function getActiveExchangeFromLocalStorage(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(ACTIVE_EXCHANGE_STORAGE_KEY);
    const v = (raw ?? '').trim();
    return v.length > 0 ? v : null;
  } catch {
    return null;
  }
}

export function setActiveExchangeToLocalStorage(exchange: string) {
  if (typeof window === 'undefined') return;
  const v = (exchange ?? '').trim();
  if (!v) return;
  try {
    window.localStorage.setItem(ACTIVE_EXCHANGE_STORAGE_KEY, v);
  } catch {
    // ignore
  }
}

export function clearActiveExchangeFromLocalStorage() {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(ACTIVE_EXCHANGE_STORAGE_KEY);
  } catch {
    // ignore
  }
}

