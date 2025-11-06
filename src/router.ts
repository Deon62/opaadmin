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
      // Default to login if route not found
      this.navigate('/login');
    }
  }

  init(): void {
    this.handleRoute();
  }
}

