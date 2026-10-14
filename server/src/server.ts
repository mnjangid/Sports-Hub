
import "dotenv/config";
import app from "./app.js";
import logger from "./utils/logger.js";

const PORT = Number(process.env.PORT) || 3000;

app.listen(PORT, () => {
  logger.info(`SportsHub server started on port ${PORT}`);
});
