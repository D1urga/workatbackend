import { app } from "./app.js";
import connectDB from "./db/index.js";

connectDB()
  .then(() => {
    app.listen(3000, () => {
      console.log("server started");
    });
  })
  .catch((e) => {
    console.log(e);
  });
