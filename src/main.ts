import { Router } from './router';
import { LoginPage } from './pages/login';
import { DashboardPage } from './pages/dashboard';
import { UsersPage } from './pages/users';
import { DriversPage } from './pages/drivers';
import { DriverDetailPage } from './pages/driver-detail';
import { ClientsPage } from './pages/clients';
import { ClientDetailPage } from './pages/client-detail';
import { CarOwnersPage } from './pages/car-owners';
import { CarOwnerDetailPage } from './pages/car-owner-detail';
import { VehiclesPage } from './pages/vehicles';
import { VehicleDetailPage } from './pages/vehicle-detail';
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

router.addRoute('/drivers/:id', () => {
  const token = localStorage.getItem('admin_token');
  if (!token) {
    router.navigate('/login');
    return;
  }
  const path = window.location.pathname;
  const params = router.getRouteParams('/drivers/:id', path);
  const driverId = parseInt(params.id);
  
  if (isNaN(driverId)) {
    router.navigate('/drivers');
    return;
  }
  
  const driverDetailPage = new DriverDetailPage(driverId);
  driverDetailPage.render();
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

router.addRoute('/clients/:id', () => {
  const token = localStorage.getItem('admin_token');
  if (!token) {
    router.navigate('/login');
    return;
  }
  const path = window.location.pathname;
  const params = router.getRouteParams('/clients/:id', path);
  const clientId = parseInt(params.id);
  
  if (isNaN(clientId)) {
    router.navigate('/clients');
    return;
  }
  
  const clientDetailPage = new ClientDetailPage(clientId);
  clientDetailPage.render();
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

router.addRoute('/car-owners/:id', () => {
  const token = localStorage.getItem('admin_token');
  if (!token) {
    router.navigate('/login');
    return;
  }
  const path = window.location.pathname;
  const params = router.getRouteParams('/car-owners/:id', path);
  const carOwnerId = parseInt(params.id);
  
  if (isNaN(carOwnerId)) {
    router.navigate('/car-owners');
    return;
  }
  
  const carOwnerDetailPage = new CarOwnerDetailPage(carOwnerId);
  carOwnerDetailPage.render();
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

router.addRoute('/vehicles/:id', () => {
  const token = localStorage.getItem('admin_token');
  if (!token) {
    router.navigate('/login');
    return;
  }
  const path = window.location.pathname;
  const params = router.getRouteParams('/vehicles/:id', path);
  const vehicleId = parseInt(params.id);
  
  if (isNaN(vehicleId)) {
    router.navigate('/vehicles');
    return;
  }
  
  const vehicleDetailPage = new VehicleDetailPage(vehicleId);
  vehicleDetailPage.render();
});

// Start router
router.init();

