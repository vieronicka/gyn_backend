// Config/passport.js
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import User from './User.js'; // Adjust path as necessary
import keys from './keys.js'; // Adjust path as necessary

const opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: keys.secretOrKey
};

export default function(passport) {
  passport.use(new JwtStrategy(opts, (jwt_payload, done) => {
    User.findById(jwt_payload.id)
      .then(user => {
        if (user) {
          return done(null, user);
        }
        return done(null, false);
      })
      .catch(err => console.log(err));
  }));
}
