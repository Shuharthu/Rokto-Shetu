/**
 * @file router.js
 * @description Lightweight SPA Hash Router with view rendering and title updates.
 */

export class Router {
  constructor(routes = {}) {
    this.routes = routes;
    this.currentRoute = null;

    window.addEventListener('hashchange', () => this.handleRouting());
    window.addEventListener('load', () => this.handleRouting());
  }

  addRoute(path, handler) {
    this.routes[path] = handler;
  }

  handleRouting() {
    const rawHash = window.location.hash || '#/';
    const [path] = rawHash.split('?');

    let handler = this.routes[path];

    if (!handler) {
      // Check prefix / dynamic routes e.g. #/verify/123 or #/card/456 or #/a/789
      for (const pattern of Object.keys(this.routes)) {
        if (pattern !== '#/' && pattern !== '#' && path.startsWith(pattern)) {
          handler = this.routes[pattern];
          break;
        }
      }
    }

    if (!handler) {
      handler = this.routes['#/'];
    }

    if (typeof handler === 'function') {
      this.currentRoute = path;
      handler();
      window.scrollTo(0, 0);
    }
  }

  navigate(path) {
    window.location.hash = path;
  }
}
