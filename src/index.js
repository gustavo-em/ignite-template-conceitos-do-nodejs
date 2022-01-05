const express = require("express");
const cors = require("cors");

const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const AWS = require("aws-sdk");
const serverless = require('serverless-http')

const USERS_TABLE = process.env.USERS_TABLE;
const dynamoDbClientParams = {};
if (process.env.IS_OFFLINE) {
  dynamoDbClientParams.region = 'localhost'
  dynamoDbClientParams.endpoint = 'http://localhost:3000'
}
const dynamoDbClient = new AWS.DynamoDB.DocumentClient(dynamoDbClientParams);


app.get("/todos/:userId", async function (req, res) {
  const params = {
    TableName: USERS_TABLE,
    Key: {
      userId: req.params.userId,
    },
  };

  try {
    const { Item } = await dynamoDbClient.get(params).promise();
    if (Item) {
      const { userId, todos } = Item;
      res.json({ userId, todos });
    } else {
      res
        .status(404)
        .json({ error: 'Could not find user with provided "userId"' });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Could not retreive user" });
  }
});


app.post("/todos/:userId", async function (req, res) {
  const { title, deadline } = req.body;
  if (typeof title !== "string") {
    res.status(400).json({ error: '"userId" must be a string' });
  } 

  const params = {
    TableName: USERS_TABLE,
    Item: {
      id: uuidv4(),
      userId: userId,
      title,
      done: false,
      deadline: new Date(deadline),
    },
  };

  try {
    await dynamoDbClient.put(params).promise();
    res.json(Item);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Could not create a todo to user" });
  }
});




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
  console.log(userFind);
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

  const todoExists = user.todos.find((t) => t.id == id);

  if (todoExists) {
    let userTodoRemoved = user.todos.filter((t)=>t.id !== id)

    user.todos = userTodoRemoved

    return response.status(204).json(user.todos);
  } else {
    return response.status(404).json({ error: "Todo Dont Found" });
  }
});



app.use((req, res, next) => {
  return res.status(404).json({
    error: "Not Found",
  });
});

module.exports.handler = serverless(app);
