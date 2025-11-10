export class Router {
  private static instance: Router;
  private routes: Map<string, () => void> = new Map();

  private constructor() {
    window.addEventListener('popstate', () => {
      this.handleRoute();
    });
  }

  static getInstance(): Router {
    if (!Router.instance) {
      Router.instance = new Router();
    }
    return Router.instance;
  }

  addRoute(path: string, handler: () => void): void {
    this.routes.set(path, handler);
  }

  navigate(path: string): void {
    window.history.pushState({}, '', path);
    this.handleRoute();
  }

  private handleRoute(): void {
    const path = window.location.pathname;
    const handler = this.routes.get(path);
    
    if (handler) {
      handler();
    } else {
      // Try to match dynamic routes (e.g., /drivers/:id)
      for (const [routePath, routeHandler] of this.routes.entries()) {
        if (this.matchRoute(routePath, path)) {
          routeHandler();
          return;
        }
      }
      // Default to login if route not found
      this.navigate('/login');
    }
  }

  private matchRoute(routePath: string, currentPath: string): boolean {
    // Check if route has parameters (e.g., /drivers/:id)
    if (routePath.includes(':')) {
      const routeParts = routePath.split('/');
      const pathParts = currentPath.split('/');
      
      if (routeParts.length !== pathParts.length) {
        return false;
      }
      
      for (let i = 0; i < routeParts.length; i++) {
        if (routeParts[i].startsWith(':')) {
          continue; // Parameter matches any value
        }
        if (routeParts[i] !== pathParts[i]) {
          return false;
        }
      }
      return true;
    }
    return false;
  }

  getRouteParams(routePath: string, currentPath: string): { [key: string]: string } {
    const params: { [key: string]: string } = {};
    const routeParts = routePath.split('/');
    const pathParts = currentPath.split('/');
    
    for (let i = 0; i < routeParts.length; i++) {
      if (routeParts[i].startsWith(':')) {
        const paramName = routeParts[i].substring(1);
        params[paramName] = pathParts[i];
      }
    }
    return params;
  }

  init(): void {
    this.handleRoute();
  }
}

