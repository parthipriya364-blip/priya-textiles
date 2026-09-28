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
          const email = profile.emails?.[0]?.value?.trim().toLowerCase();
          const name = profile.displayName;
          const googleId = profile.id;

          if (!email || profile._json?.email_verified !== true) {
            return done(new Error('Google account must have a verified email address'));
          }

          let user = await User.findOne({ email });

          if (user) {
            if (user.googleId && user.googleId !== googleId) {
              return done(new Error('This email is linked to another Google account'));
            }

            if (!user.googleId) {
              user.googleId = googleId;
              await user.save({ validateBeforeSave: false });
            }

            return done(null, user);
          }

          user = await User.create({
            name,
            email,
            googleId,
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
