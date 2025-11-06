import { Router } from './router';
import { LoginPage } from './pages/login';
import { DashboardPage } from './pages/dashboard';
import { UsersPage } from './pages/users';
import { DriversPage } from './pages/drivers';
import { ClientsPage } from './pages/clients';
import { CarOwnersPage } from './pages/car-owners';
import { VehiclesPage } from './pages/vehicles';
import { Layout } from './components/layout';

// Initialize router
const router = Router.getInstance();

// Make router available globally for navigation
(window as any).router = router;

// Register routes
router.addRoute('/', () => {
  // Redirect to login if not authenticated
  const token = localStorage.getItem('admin_token');
  if (!token) {
    router.navigate('/login');
  } else {
    router.navigate('/dashboard');
  }
});

router.addRoute('/login', () => {
  const token = localStorage.getItem('admin_token');
  if (token) {
    router.navigate('/dashboard');
    return;
  }
  const loginPage = new LoginPage();
  loginPage.render();
});

router.addRoute('/dashboard', () => {
  const token = localStorage.getItem('admin_token');
  if (!token) {
    router.navigate('/login');
    return;
  }
  const dashboardPage = new DashboardPage();
  dashboardPage.render();
});

router.addRoute('/users', () => {
  const token = localStorage.getItem('admin_token');
  if (!token) {
    router.navigate('/login');
    return;
  }
  const usersPage = new UsersPage();
  usersPage.render();
});

router.addRoute('/drivers', () => {
  const token = localStorage.getItem('admin_token');
  if (!token) {
    router.navigate('/login');
    return;
  }
  const driversPage = new DriversPage();
  driversPage.render();
});

router.addRoute('/clients', () => {
  const token = localStorage.getItem('admin_token');
  if (!token) {
    router.navigate('/login');
    return;
  }
  const clientsPage = new ClientsPage();
  clientsPage.render();
});

router.addRoute('/car-owners', () => {
  const token = localStorage.getItem('admin_token');
  if (!token) {
    router.navigate('/login');
    return;
  }
  const carOwnersPage = new CarOwnersPage();
  carOwnersPage.render();
});

router.addRoute('/vehicles', () => {
  const token = localStorage.getItem('admin_token');
  if (!token) {
    router.navigate('/login');
    return;
  }
  const vehiclesPage = new VehiclesPage();
  vehiclesPage.render();
});

// Start router
router.init();

