import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import path from 'path';
import passport from 'passport';
import { fileURLToPath } from 'url';
import * as dotenv from 'dotenv';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import OpenAI from 'openai';
import User from './models/user.model.js';   

// Load environment variables
dotenv.config();

// Initialize Express
const app = express();

// Trust proxy (so req.protocol reflects HTTPS behind load balancer)
app.set('trust proxy', true);

// Passport configuration (Google OAuth)
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL
}, async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await User.findOne({ googleId: profile.id });
    if (!user) {
      user = await User.findOne({ email: profile.emails[0].value });
      if (user) {
        user.googleId = profile.id;
        user.picture = profile.photos[0].value;
      } else {
        user = new User({
          name: profile.displayName,
          email: profile.emails[0].value,
          googleId: profile.id,
          picture: profile.photos[0].value,
          password: Math.random().toString(36)
        });
      }
      await user.save();
    }
    done(null, user);
  } catch (err) {
    done(err, null);
  }
}));

// Initialize Passport
app.use(passport.initialize());

// Middleware
app.use(helmet());

const allowedOrigins = [
  'http://localhost:3000',
  process.env.FRONTEND_URL
];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS policy does not allow origin ${origin}`), false);
    }
  },
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));

// Swagger docs
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const swaggerDocument = YAML.load(path.join(__dirname, 'swagger.yaml'));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Route imports
import authRoutes from './routes/auth.routes.js';
import customerRoutes from './routes/customer.routes.js';
import campaignRoutes from './routes/campaign.routes.js';
import segmentRoutes from './routes/segment.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';
import aiRoutes from './routes/ai.routes.js';

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/campaigns', campaignRoutes);
app.use('/api/segments', segmentRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/ai', aiRoutes);

// Optional root route
app.get('/', (req, res) => res.send('CRM backend is running'));

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Something went wrong', error: err.message });
});

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// OpenAI client
export const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
