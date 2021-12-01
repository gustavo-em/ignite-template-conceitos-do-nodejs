const express = require("express");
const cors = require("cors");

const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

//check user exists for new request
function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const userExists = users.find((u) => u.username == username);
  if (userExists) {
    request.username = username;
    return next();
  } else {
    return response.status(400).json({ error: "User Not Exists" });
  }
}

//new user
app.post("/users", (request, response) => {
  const { username, name } = request.body;

  const userAlreadyExists = users.some((u) => u.username == username);
  if (userAlreadyExists) {
    return response.status(400).json({ error: "UserName Already Exists" });
  }

  const userPost = {
    id: uuidv4(),
    name,
    username,
    todos: [],
  };

  users.push(userPost);

  return response.status(201).json(userPost);
});

//get todos by username
app.get("/todos", checksExistsUserAccount, (request, response) => {
  const { username } = request;

  const userFind = users.find((u) => (u.username = username));

  if (userFind) {
    return response.json(userFind.todos);
  }
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const username = request.username;

  const todoPost = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: Date.now(),
  };

  const user = users.find((u) => u.username == username);

  const index = users.findIndex((i) => i == user);
  if (index != -1) {
    users[index].todos.push(todoPost);
    return response.status(201).json(todoPost);
  } else {
    return response(400).json({ error: "User Not Found" });
  }
});

//Alterar title e deadline do todo
app.put("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { username } = request;
  const { id } = request.params;
  const { title, deadline } = request.body;

  const indexUser = users.findIndex((u) => u.username == username);
  const todo = users[indexUser].todos.find((t) => t.id == id);
  if (!todo) {
    return response.status(404).json({ error: "Todo Not Found" });
  }
  console.log(todo);
  todo.title = title;
  todo.deadline = new Date(deadline);

  return response.json(todo);
});

app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
  const { username } = request;
  const { id } = request.params;

  const user = users.find((u) => u.username == username);
  const indexTodo = user.todos.findIndex((t) => t.id == id);
  if (indexTodo != -1) {
    user.todos[indexTodo].done = true;
    return response.json(user.todos[indexTodo]);
  } else {
    return response.status(404).json({ error: "Todo Not Found" });
  }
});

app.delete("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { username } = request;

  const user = users.find((u) => u.username == username);

  const indexTodo = user.todos.findIndex((t) => t.id == id);

  //console.log(indexTodo);
  if (indexTodo != -1) {
    user.todos.splice(indexTodo, 1);
    return response.status(204).json(user);
  } else {
    return response.status(404).json({ error: "Todo Dont Found" });
  }
});

module.exports = app;
