import { useEffect, useState } from "react";
import type { TKey } from "./i18n";
import type { CategoryId } from "./expenses";

export type QuickActionItem = {
  id: string;
  /** translation key for built-in presets */
  key?: TKey;
  /** free text label for user-created actions */
  label?: string;
  category: CategoryId;
};

export type TagItem = {
  id: string;
  key?: TKey;
  label?: string;
};

const QUICK_KEY = "customQuickActions.v1";
const TAGS_KEY = "customTags.v1";

export const DEFAULT_QUICK_ACTIONS: QuickActionItem[] = [
  { id: "q-coffee", key: "quick_coffee", category: "food" },
  { id: "q-supermarket", key: "quick_supermarket", category: "food" },
  { id: "q-snack", key: "quick_snack", category: "food" },
  { id: "q-water", key: "quick_water", category: "food" },
  { id: "q-taxi", key: "quick_taxi", category: "transport" },
  { id: "q-tips", key: "quick_tips", category: "local" },
];

export const DEFAULT_TAGS: TagItem[] = [
  { id: "t-kids", key: "tag_kids" },
  { id: "t-family", key: "tag_family" },
  { id: "t-work", key: "tag_work" },
  { id: "t-fun", key: "tag_fun" },
];

/** value persisted on the expense row */
export const tagValue = (tag: TagItem) => tag.key ?? tag.label ?? tag.id;

export const labelOf = (
  item: { key?: TKey; label?: string },
  t: (k: TKey) => string,
) => (item.key ? t(item.key) : (item.label ?? ""));

const newId = () => Math.random().toString(36).slice(2, 9);

type Store = { quick: QuickActionItem[]; tags: TagItem[] };

let store: Store = { quick: DEFAULT_QUICK_ACTIONS, tags: DEFAULT_TAGS };
let hydrated = false;
const listeners = new Set<(s: Store) => void>();

function read<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as T) : fallback;
  } catch {
    return fallback;
  }
}

function hydrate() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  store = {
    quick: read(QUICK_KEY, DEFAULT_QUICK_ACTIONS),
    tags: read(TAGS_KEY, DEFAULT_TAGS),
  };
}

function commit(next: Store) {
  store = next;
  try {
    window.localStorage.setItem(QUICK_KEY, JSON.stringify(next.quick));
    window.localStorage.setItem(TAGS_KEY, JSON.stringify(next.tags));
  } catch {
    /* storage unavailable */
  }
  listeners.forEach((l) => l(store));
}

export function useCustomLists() {
  const [state, setState] = useState<Store>(store);

  useEffect(() => {
    hydrate();
    setState(store);
    const listener = (s: Store) => setState(s);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  return {
    quickActions: state.quick,
    tags: state.tags,
    addQuickAction: (label: string, category: CategoryId) =>
      commit({ ...store, quick: [...store.quick, { id: newId(), label, category }] }),
    updateQuickAction: (id: string, label: string, category: CategoryId) =>
      commit({
        ...store,
        quick: store.quick.map((q) =>
          q.id === id ? { id: q.id, label, category } : q,
        ),
      }),
    removeQuickAction: (id: string) =>
      commit({ ...store, quick: store.quick.filter((q) => q.id !== id) }),
    addTag: (label: string) =>
      commit({ ...store, tags: [...store.tags, { id: newId(), label }] }),
    removeTag: (id: string) =>
      commit({ ...store, tags: store.tags.filter((x) => x.id !== id) }),
  };
}
