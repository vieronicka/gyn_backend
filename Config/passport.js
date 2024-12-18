// // Config/passport.js
// import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
// import User from './User.js'; // Adjust path as necessary
// import keys from './keys.js'; // Adjust path as necessary

// const opts = {
//   jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
//   secretOrKey: keys.secretOrKey
// };

// export default function(passport) {
//   passport.use(new JwtStrategy(opts, (jwt_payload, done) => {
//     User.findById(jwt_payload.id)
//       .then(user => {
//         if (user) {
//           return done(null, user);
//         }
//         return done(null, false);
//       })
//       .catch(err => console.log(err));
//   }));
// }
const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
const Staff = require('../models/staff');  // Path to your Staff model
const keys = require('./keys.js');  // Path to your keys file

const opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: keys.secretOrKey,  // Ensure the JWT secret is correct
};

module.exports = function(passport) {
  passport.use(
    new JwtStrategy(opts, (jwt_payload, done) => {
      Staff.findByPk(jwt_payload.id)  // Adjust based on your database model (findById or findByPk)
        .then(staff => {
          if (staff) {
            return done(null, staff);  // If staff found, return the staff
          }
          return done(null, false);  // If no staff found, authentication fails
        })
        .catch(err => {
          console.log(err);
          return done(err, false);  // Return error if there's an issue
        });
    })
  );
};
