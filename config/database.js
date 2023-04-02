const path = require("path");

module.exports = ({ env }) => ({
  connection: {
    client: "postgres",
    connection: {
      host: "hivefolio-db-postgresql-do-user-13837864-0.b.db.ondigitalocean.com",
      port: 25060,
      database: "defaultdb",
      user: "doadmin",
      password: "AVNS_TCPzK63RTbGTAFEQh7m",
      // host: env("DATABASE_HOST", "localhost"),
      // port: env.int("DATABASE_PORT", 5432),
      // database: env("DATABASE_NAME", "hivefolio-db"),
      // user: env("DATABASE_USERNAME", "postgres"),
      // password: env("DATABASE_PASSWORD", "root"),
      schema: "public", // Not required
      ssl: {
        rejectUnauthorized: false,
      },
    },
    debug: false,
  },
});
