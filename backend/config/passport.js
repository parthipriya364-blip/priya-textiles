const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

// Only configure Google OAuth if credentials are provided
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  // Configure Google OAuth Strategy
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // Extract user info from Google profile
          const email = profile.emails[0].value;
          const name = profile.displayName;
          const googleId = profile.id;

          // Check if user already exists
          let user = await User.findOne({ email });

          if (user) {
            // User exists - update Google ID if not set
            if (!user.googleId) {
              user.googleId = googleId;
              await user.save({ validateBeforeSave: false });
            }
            return done(null, user);
          }

          // Create new user
          user = await User.create({
            name,
            email,
            googleId,
            password: Math.random().toString(36).slice(-8), // Random password (won't be used)
            isGoogleUser: true,
            role: 'user',
          });

          done(null, user);
        } catch (error) {
          console.error('Google OAuth error:', error);
          done(error, null);
        }
      }
    )
  );

  // Serialize user for session
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  // Deserialize user from session
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });

  console.log('✅ Google OAuth Strategy configured');
} else {
  console.warn('⚠️  Google OAuth not configured - GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET missing in .env');
}

module.exports = passport;
