# Deployment Guide

## Step-by-Step Deployment Instructions

### Step 1: Prepare MongoDB Atlas

1. **Create MongoDB Atlas Account**
   - Go to https://www.mongodb.com/cloud/atlas
   - Sign up for free account

2. **Create Cluster**
   - Click "Build a Cluster"
   - Select FREE tier (M0)
   - Choose your preferred region
   - Click "Create Cluster"

3. **Create Database User**
   - Go to "Database Access"
   - Click "Add New Database User"
   - Choose "Password" authentication
   - Username: `agency_user`
   - Password: Generate a secure password (save it!)
   - User Privileges: "Read and write to any database"
   - Click "Add User"

4. **Whitelist IP Addresses**
   - Go to "Network Access"
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere" (0.0.0.0/0)
   - Click "Confirm"

5. **Get Connection String**
   - Go to "Database" → "Connect"
   - Choose "Connect your application"
   - Copy connection string
   - Replace `<password>` with your database user password
   - Replace `myFirstDatabase` with `agency_db`
   - Final format: `mongodb+srv://agency_user:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/agency_db`

### Step 2: Deploy Backend to Render

1. **Push Code to GitHub**
   ```bash
   cd "agency manager"
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/YOUR_USERNAME/agency-manager.git
   git push -u origin main
   ```

2. **Create Render Account**
   - Go to https://render.com
   - Sign up with GitHub

3. **Create New Web Service**
   - Click "New" → "Web Service"
   - Connect your GitHub repository
   - Grant access to the repository

4. **Configure Service**
   - Name: `agency-manager-backend`
   - Root Directory: `agency-manager-backend`
   - Environment: `Node`
   - Branch: `main`
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Instance Type: Free

5. **Add Environment Variables**
   Click "Advanced" → "Add Environment Variable" for each:
   ```
   NODE_ENV = production
   MONGODB_URI = your_mongodb_atlas_connection_string_from_step_1
   JWT_SECRET = generate_a_random_secret_string_32_characters_long
   JWT_EXPIRES_IN = 30m
   CLOUDINARY_CLOUD_NAME = your_cloudinary_name
   CLOUDINARY_API_KEY = your_cloudinary_key
   CLOUDINARY_API_SECRET = your_cloudinary_secret
   ```

6. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment (5-10 minutes first time)
   - Your backend URL: `https://agency-manager-backend-XXXX.onrender.com`

7. **Test Backend**
   ```bash
   curl https://your-backend-url.onrender.com/health
   # Should return: {"status":"OK"}
   ```

### Step 3: Deploy Frontend to Netlify

1. **Update Frontend Environment**
   ```bash
   cd agency-manager-frontend
   ```
   
   Edit `src/environments/environment.prod.ts`:
   ```typescript
   export const environment = {
     production: true,
     apiUrl: 'https://your-backend-url.onrender.com'
   };
   ```

2. **Commit Changes**
   ```bash
   git add src/environments/environment.prod.ts
   git commit -m "Update production API URL"
   git push
   ```

3. **Create Netlify Account**
   - Go to https://www.netlify.com
   - Sign up with GitHub

4. **Create New Site**
   - Click "Add new site" → "Import an existing project"
   - Choose GitHub
   - Select your repository
   
5. **Configure Build Settings**
   - Base directory: `agency-manager-frontend`
   - Build command: `npm run build`
   - Publish directory: `dist/agency-manager-frontend/browser`
   - Click "Deploy site"

6. **Wait for Deployment**
   - First deployment: 3-5 minutes
   - Your frontend URL: `https://random-name-12345.netlify.app`

7. **Custom Domain (Optional)**
   - Go to Site settings → Domain management
   - Click "Add custom domain"
   - Follow instructions

### Step 4: Test Complete Application

1. **Open Frontend URL**
   - Visit your Netlify URL

2. **Register New Account**
   - Click "Register"
   - Create test account

3. **Create Organization**
   - After login, create a new organization

4. **Test Complete Flow**
   - Create a client
   - Create a project
   - Create tasks
   - Assign tasks to yourself
   - Check "My Tasks"

### Step 5: Create Test Accounts

Create 2-3 test accounts for submission:
1. Admin account: `admin@test.com` / `Admin123!`
2. User account: `user@test.com` / `User123!`

## Troubleshooting

### Backend Issues

**Problem**: Backend won't start
- Check Render logs for errors
- Verify all environment variables are set
- Check MongoDB Atlas connection string

**Problem**: CORS errors
- Backend already has CORS enabled
- Check frontend is using correct API URL

**Problem**: Database connection fails
- Verify MongoDB Atlas IP whitelist
- Check connection string format
- Ensure database user has correct permissions

### Frontend Issues

**Problem**: API calls failing
- Check `environment.prod.ts` has correct backend URL
- Check browser console for errors
- Verify backend is running

**Problem**: Build fails on Netlify
- Check build logs
- Verify all dependencies are in package.json
- Check Node version compatibility

## Environment Variables Reference

### Backend Required Variables
```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/agency_db
JWT_SECRET=your-super-secret-jwt-key-min-32-characters
JWT_EXPIRES_IN=30m
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Generating Secure JWT Secret
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Post-Deployment Checklist

- [ ] Backend health check returns OK
- [ ] Frontend loads without errors
- [ ] Can register new account
- [ ] Can login with test accounts
- [ ] Can create organization
- [ ] Can create client
- [ ] Can create project
- [ ] Can create and assign tasks
- [ ] My Tasks page shows assigned tasks
- [ ] File uploads work (if using Cloudinary)

## Monitoring

### Render Monitoring
- View logs in Render dashboard
- Check uptime and performance
- Set up alerts for downtime

### Netlify Monitoring
- View deploy logs
- Check analytics
- Monitor bandwidth usage

## Updating Application

### Backend Updates
```bash
git add .
git commit -m "Update message"
git push
# Render auto-deploys on push
```

### Frontend Updates
```bash
git add .
git commit -m "Update message"
git push
# Netlify auto-deploys on push
```

## Support

If you encounter issues:
1. Check application logs
2. Review error messages
3. Check environment variables
4. Verify database connection
5. Test API endpoints directly

---

**Deployment Completion Checklist**

Fill this out for submission:
- [ ] MongoDB Atlas cluster created
- [ ] Backend deployed to Render
- [ ] Frontend deployed to Netlify
- [ ] Test accounts created
- [ ] All features tested in production
- [ ] README updated with live URLs
- [ ] GitHub repository is public

**Live URLs for Submission:**
- Frontend: `https://your-app.netlify.app`
- Backend API: `https://your-backend.onrender.com`
- GitHub: `https://github.com/your-username/agency-manager`

**Test Credentials:**
- Email: `test@example.com`
- Password: `Test123!`
