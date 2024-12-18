'use strict';

/** @type {import('sequelize-cli').Seeder} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('staff', [{
      full_name: 'vieronicka',
      email: 'viero@gmail.com',
      phone_no: 771236543,
      role: 'consultant', // Role set as superadmin
      password: '$2a$10$epb9ppxqnhhGicjvodtbn.vz9.BMCiMp9Fk1wrZjtPKASUhOGgNve', // Hashed password (already hashed)
      status: 'active', // Assuming status should be active for superadmin
    }], {});
  },

  async down(queryInterface, Sequelize) {
    // Rollback the insertion (in case you need to undo the seeder)
    await queryInterface.bulkDelete('staff', { email: 'viero@gmail.com' }, {});
  }
};
