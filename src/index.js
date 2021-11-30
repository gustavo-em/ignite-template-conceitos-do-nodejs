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
  const { username, user } = request.body;

  const userAlreadyExists = users.some((u) => u.username == username);
  if (userAlreadyExists) {
    return response.status(400).json({ error: "UserName Already Exists" });
  }

  const userPost = {
    id: uuidv4(),
    user,
    username,
    todos: [],
  };

  users.push(userPost);
  return response.status(201).json(userPost);
});

//get todos by username
app.get("/todos", checksExistsUserAccount, (request, response) => {
  const username = request.username;

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
    users[0].todos.push(todoPost);
  } else {
    return response(400).json({ error: "User Not Found" });
  }

  return response.json(users);
});

app.put("/todos/:id", checksExistsUserAccount, (request, response) => {});

app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
  // Complete aqui
});

app.delete("/todos/:title", checksExistsUserAccount, (request, response) => {
  const { title } = request.params;

  const username = request.username;
  const indexUser = users.findIndex((u) => u.username == username);

  const indexTodo = users[indexUser].todos.findIndex((t) => t.title == title);

  //console.log(indexTodo);
  if (indexTodo != -1) {
    users[indexUser].todos.splice(indexTodo, 1);
    return response.json(users[indexUser]);
  } else {
    return response.json({ error: "Todo Dont Found" });
  }
});

module.exports = app;
