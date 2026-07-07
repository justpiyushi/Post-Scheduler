import app from "./src/app.js";
import connectDB from "./src/db/db.js";
import { initScheduler } from "./src/services/scheduler.service.js";

const port = process.env.PORT || 4000;

await connectDB();

initScheduler();

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
