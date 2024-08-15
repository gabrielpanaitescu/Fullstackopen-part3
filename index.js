require("dotenv").config();
const express = require("express");
const app = express();
const Person = require("./models/person");

let persons = [
  {
    id: "1",
    name: "Arto Hellas",
    number: "040-123456",
  },
  {
    id: "2",
    name: "Ada Lovelace",
    number: "39-44-5323523",
  },
  {
    id: "3",
    name: "Dan Abramov",
    number: "12-43-234345",
  },
  {
    id: "4",
    name: "Mary Poppendieck",
    number: "39-23-6423122",
  },
];

app.use(express.static("dist"));

const cors = require("cors");
app.use(cors());

app.use(express.json());

const morgan = require("morgan");
morgan.token("content", function (req, res) {
  return JSON.stringify(req.body);
});
app.use(
  morgan(
    ":method :url :status :res[content-length] - :response-time ms :content"
  )
);

app.get("/info", (req, res) => {
  const time = new Date();
  const numberOfPersons = persons.length;

  res.send(
    `<p>Phonebook has info for ${numberOfPersons} person/s</p>
       <p>${time}</p>`
  );
});

app.get("/", (req, res) => {
  res.send("Hello world!");
});

app.get("/api/persons", (req, res) => {
  Person.find({}).then((persons) => {
    res.json(persons);
  });
});

app.get("/api/persons/:id", (req, res, next) => {
  const id = req.params.id;
  Person.findById(id)
    .then((person) => {
      if (person) {
        res.json(person);
      } else {
        res.status(404).end();
      }
    })
    .catch((error) => next(error));
});

app.delete("/api/persons/:id", (req, res, next) => {
  const id = req.params.id;

  // persons = persons.filter((person) => person.id !== id);
  Person.findByIdAndDelete(id)
    .then((result) => {
      res.status(204).end();
    })
    .catch((error) => next(error));
});

const generateId = () => {
  while (true) {
    const newId = Math.floor(Math.random() * 1000000);

    if (!persons.some((person) => person.id === newId)) return String(newId);
  }
};

app.post("/api/persons", (req, res) => {
  const body = req.body;
  if (!(body.name && body.number))
    return res.status(400).json({ error: "Name and/or number are missing" });

  // need revision with MongoDB
  // const isDuplicate = persons.some(
  //   (person) => person.name.toLowerCase() === body.name.toLowerCase()
  // );
  // if (isDuplicate)
  //   return res.status(409).json({ error: "Name already exists" });

  const newPerson = new Person({
    name: body.name,
    number: body.number,
    id: generateId(),
  });

  newPerson.save().then((savedPerson) => {
    res.json(savedPerson);
  });
});

app.use((req, res) => {
  res.status(404).send({ error: "unknown endpoint" });
});

const errorHandler = (error, req, res, next) => {
  console.error(error.name, error.message);
  if (error.name === "CastError")
    return res.status(400).send({ error: "malformatted id" });

  next(error);
};

app.use(errorHandler);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
