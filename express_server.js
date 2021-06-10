const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser')

// middleware
app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));

app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
}

const checkUserExist = (email) => {
  const keys = Object.keys(users);
  for (let key of keys) {
    if (users[key].email === email) {
      return true;
    }
  }
  return false;
}


app.post('/register', (req, res) => {
  // grab the information from the body
  const password = req.body.password;
  const email = req.body.email;

  if (!password || !email) {
    return res.status(400).send('You must enter an email AND a password');
  }

  if (checkUserExist(email)) {
    return res.status(400).send('The email you entered has been used. Please enter another email.')
  }

  // create our new user object
  const newUserId = generateRandomString();
  const newUser = {
    id: newUserId,
    email,
    password
  }

  // add our new user to the users object
  users[newUserId] = newUser;
  // console.log(users);
  // redirect the user to the login page
  res.cookie('user_id', newUserId);
  res.redirect('/urls');
});

app.post('/login', (req, res) => {
  // pull the info off the body
  const email = req.body.email;
  const password = req.body.password;
  // console.log(checkUserExist(email));
  if (!checkUserExist(email)) {
    return res.status(403).send('Email could not be found.');
  }
  
  let registeredUser;
  for (const userId in users) {
    const user = users[userId];
    if (user.email === email) {
      registeredUser = user;
    }
  }

  // compare the user's password
  if (registeredUser.password !== password) {
    // if the passwords don't match, send back an error response
    return res.status(403).send('Email and password do not match');
  }

  // set the cookie and redirect to the protected page
  res.cookie('user_id', registeredUser.id);
  res.redirect('/urls');
});


app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls');    
});

app.post("/urls", (req, res) => {
  // console.log(req.body);  // Log the POST request body to the console
  const longURL = req.body.longURL;
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = longURL;
  // console.log(urlDatabase);
  res.redirect(`/urls/${shortURL}`);         // Respond with 'Ok' (we will replace this)
});

app.post("/urls/:shortURL", (req, res) => {
  // console.log(req.body);
  const longURL = req.body.longURL;
  const shortURL = req.params.shortURL;
  urlDatabase[shortURL] = longURL;
  res.redirect('/urls');         // Respond with 'Ok' (we will replace this)
});

app.get("/register", (req, res) => {
  const templateVars = { urls: urlDatabase, user: users[req.cookies["user_id"]] };
  res.render("urls_register", templateVars);
});

app.get("/login", (req, res) => {
  const templateVars = { urls: urlDatabase, user: users[req.cookies["user_id"]] };
  res.render("urls_login", templateVars);
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase, user: users[req.cookies["user_id"]] };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = { user: users[req.cookies["user_id"]] }
  res.render("urls_new", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL];
  res.redirect(longURL);
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], user: users[req.cookies["user_id"]] };
  res.render("urls_show", templateVars);
});

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.post('/urls/:url/edit', (req, res) => {
  const urlToBeEdited = req.params.url;
  
  res.redirect(`/urls/${urlToBeEdited}`);
});


app.post('/urls/:url/delete', (req, res) => {
  const urlToBeDeleted = req.params.url;
  delete urlDatabase[urlToBeDeleted];

  res.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});



function generateRandomString() {
  return Math.random().toString(36).substr(2, 6)
}