import express from 'express'
const app = express()
const port = process.env.API_PORT


import passport from 'passport'
import cookieParser from 'cookie-parser'
import session from 'express-session'
import bodyParser from 'body-parser'

app.use(cookieParser());
app.use(bodyParser());
// @ts-ignore
app.use(session({ secret: process.env.SECRET_KEY_BASE }));
app.use(passport.initialize());
app.use(passport.session());

import LocalStrategy from 'passport-local';
passport.use(new LocalStrategy.Strategy(
  (username, password, done) => {
    const user = { username, password }
    return done(null, user);
  }
));

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  console.log(user)
  done(null, user);
});

const userAuth = passport.authenticate('local', { session: true })

app.post('/login', userAuth, (req: express.Request, res: express.Response) => {
  console.log(req.body)
  res.send('Hello World!!')
})
app.get('/', (req: express.Request, res: express.Response) => {
  console.log(req.body)
  res.send('Hello World!!')
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))


