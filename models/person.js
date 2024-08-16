const mongoose = require("mongoose");

mongoose.set("strictQuery", false);

const url = process.env.MONGODB_URI;

console.log("connecting to: ", url);

mongoose
  .connect(url)
  .then((response) => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.log("Error connecting to MongoDB", error.message);
  });

const personSchema = new mongoose.Schema({
  name: {
    type: String,
    minLength: 3,
  },
  number: {
    type: String,
    minLength: 7,
  },
});

personSchema.set("toJSON", {
  transform: (document, returnedObj) => {
    returnedObj.id = returnedObj._id;
    delete returnedObj._id;
    delete returnedObj.__v;
  },
});

module.exports = mongoose.model("Person", personSchema);
