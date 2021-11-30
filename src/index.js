const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const {user} = request.headers
  const alreadyExistsUser = users.some(u=>u.user == user)

  if(!alreadyExistsUser) return response.status(400).send({"error": "User Not Exists"})
  
  request.user = user;

  next()

}

app.post('/users', (request, response) => {
  const {username, user} = request.body;

  const userPost = {
    id: uuidv4(),
    user,
    username,
    todos: []
  }

  users.push(userPost)
  return response.status(201).json(userPost)
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const user = request.user  
 
  const userFind = users.find(u=>u.user = request.user)
  
  if(userFind) return response.json(userFind.todos)

  

});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline} = request.body;

  todoPost = {
    id: uuidv4(),
    title,
    done: false,
    deadline,
    created_at: Date.now()
  }

  const user = request.user

  const usersSearched = users.map((u)=>{
    console.log('uuuuuuuuu',u.todos)
    if(u.user == user){
      return u.todos.push(todoPost)
    } else {
      return u
    }

  })

  const userSearch = usersSearched.find(u=>{u.user == user})

  return response.json(userSearch)

});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  // Complete aqui
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  // Complete aqui
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  // Complete aqui
});

module.exports = app;