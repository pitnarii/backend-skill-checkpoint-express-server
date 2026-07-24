// Create PostgreSQL Connection Pool here !
import pg from "pg";
const { Pool } = pg;

const connectionPool = new Pool({
  connectionString:
    "postgresql://postgres:4541@localhost:5432/quora",
});

export default connectionPool;
