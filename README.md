# Admin Web Application

Admin panel web application for OPA - On-Demand Driver & Car Rental Platform.

## Development

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure API URL (optional):**
   - Create a `.env` file in the root directory
   - Add your API base URL:
     ```
     VITE_API_BASE_URL=http://localhost:8000
     ```
   - If not set, defaults to `http://localhost:8000`

3. **Run development server:**
   ```bash
   npm run dev
   ```

4. **Build for production:**
   ```bash
   npm run build
   ```

## Production Deployment

### Setting Production API URL

The API base URL is configured via the `VITE_API_BASE_URL` environment variable. You need to set this during the build process.

#### Option 1: Environment Variable (Recommended)

Set the environment variable before building:

```bash
VITE_API_BASE_URL=https://api.yourdomain.com npm run build
```

#### Option 2: Vercel Environment Variables

If deploying to Vercel:

1. Go to your Vercel project settings
2. Navigate to "Environment Variables"
3. Add a new variable:
   - **Name:** `VITE_API_BASE_URL`
   - **Value:** `https://api.yourdomain.com`
   - **Environment:** Production (and Preview if needed)
4. Redeploy your application

#### Option 3: Create `.env.production` file

1. Create a `.env.production` file in the root directory
2. Add your production API URL:
   ```
   VITE_API_BASE_URL=https://api.yourdomain.com
   ```
3. Build the application:
   ```bash
   npm run build
   ```

### Important Notes

- The API base URL is embedded at **build time**, not runtime
- You must rebuild the application if you change the API URL
- Make sure your production backend has CORS configured to allow requests from your frontend domain
- Ensure the backend serves static files from the `/uploads` directory

## Configuration

The API configuration is located in `src/config/api.ts`. The base URL is automatically used for:
- All API endpoints
- Document/image URLs (uploads)

## Project Structure

```
admin-web/
├── src/
│   ├── components/     # Reusable components (Layout, etc.)
│   ├── config/         # Configuration files (API endpoints)
│   ├── pages/          # Page components
│   ├── router/         # Client-side router
│   ├── services/       # API service layer
│   └── styles/         # CSS styles
├── dist/               # Production build output
└── index.html          # Entry HTML file
```
