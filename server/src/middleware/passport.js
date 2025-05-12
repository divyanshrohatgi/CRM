const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/user.model');

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/api/auth/google/callback"
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      let user = await User.findOne({ googleId: profile.id });
      if (!user) {
        // If user with this Google ID doesn't exist, create one
        user = await User.findOne({ email: profile.emails[0].value });
        if (user) {
          // Link Google account to existing user
          user.googleId = profile.id;
          user.picture = profile.photos[0].value;
        } else {
          // Create new user
          user = new User({
            name: profile.displayName,
            email: profile.emails[0].value,
            googleId: profile.id,
            picture: profile.photos[0].value,
            password: Math.random().toString(36) // random password, not used
          });
        }
        await user.save();
      }
      return done(null, user);
    } catch (err) {
      return done(err, null);
    }
  }
)); 