/**
 * @file store.js
 * @description Centralized reactive state store for user, auth, and onboarding drafts.
 */

class Store {
  constructor() {
    this.state = {
      user: null,
      isAuthenticated: false,
      role: 'guest',
      wizardDraft: this.loadDraft(),
    };
    this.listeners = new Set();
  }

  loadDraft() {
    try {
      const saved = localStorage.getItem('roktosetu_wizard_draft');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  }

  saveDraft(data) {
    this.state.wizardDraft = { ...this.state.wizardDraft, ...data };
    try {
      localStorage.setItem('roktosetu_wizard_draft', JSON.stringify(this.state.wizardDraft));
    } catch (e) {
      console.warn('Failed to save wizard draft:', e);
    }
    this.notify();
  }

  clearDraft() {
    this.state.wizardDraft = {};
    localStorage.removeItem('roktosetu_wizard_draft');
    this.notify();
  }

  setUser(user) {
    this.state.user = user;
    this.state.isAuthenticated = !!user;
    this.state.role = user?.role || 'guest';
    this.notify();
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify() {
    for (const listener of this.listeners) {
      listener(this.state);
    }
  }
}

export const store = new Store();
