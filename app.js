const express = require('express')
const app = express()
const path = require('path')
const session = require('express-session')
const passport = require('passport')
const LocalStrategy = require('passport-local')
const bcrypt = require('bcrypt')
const MongoStore = require('connect-mongo')
require('dotenv').config()

const { createServer } = require('http')
const { Server } = require('socket.io')
const server = createServer(app)
const io = new Server(server)

app.use(express.static(path.join((__dirname + '/public')))) // 경로 설정
app.set('view engine', 'ejs')
app.use(express.json())
app.use(express.urlencoded({extended:true}))

// passport 라이브러리 세팅
app.use(passport.initialize())
const sessionMiddleware = session({
  secret: process.env.HASH_PASSWORD,
  resave : false,
  saveUninitialized : false,
  cookie : { maxAge : 24 * 60 * 60 * 1000 },
  store : MongoStore.create({
    mongoUrl : process.env.DB_URL,
    dbName : 'web'
  })
}) // 세션 설정
app.use(sessionMiddleware)
app.use(passport.session())

const { MongoClient, ObjectId } = require('mongodb')
let db
const url = process.env.DB_URL
new MongoClient(url).connect().then((client) => {
  console.log('DB connected');
  db = client.db('web')
  server.listen(process.env.PORT, "0.0.0.0", () => {
    console.log(`port ${process.env.PORT} open`)
  })
}).catch((err) => {
  console.log(err)
})

app.get('/', (req, res) => {
  res.render('main.ejs')
  if (req.user) {
    console.log('HOME connection : ', req.user)
  } else {
    console.log('status(NOT LOGED IN) : HOME')
  }
})

app.get('/mypage', (req, res) => {
  if (req.user) {
    res.render('mypage.ejs', {user : req.user})
  } else {
    res.render('alert.ejs', {error:'로그인하세요'})
  }
})

app.get('/signup', (req, res) => {
  res.render('signup.ejs')
})

app.post('/signup', async (req, res) => {
  if (req.body.password && req.body.password_check && req.body.username && req.body.nickname) {
    if (req.body.password == req.body.password_check) {
      let hash = await bcrypt.hash(req.body.password, 10)
      await db.collection('user').insertOne({
        username : req.body.username,
        password : hash,
        nickname : req.body.nickname
      })
      console.log('새로운 사용자 추가 :', req.body.username, req.body.nickname)
      res.redirect('/login')
    } else {
      res.render('alert.ejs', {error:'비밀번호를 확인해주세요'})
    }
  } else {
    res.render('alert.ejs', {error:'모든 항목을 입력해주세요'})
  }
})

passport.use(new LocalStrategy(async (입력한아이디, 입력한비번, cb) => {
  let result = await db.collection('user').findOne({ username : 입력한아이디})
  if (!result) {
    return cb(null, false, { message: '존재하지 않는 ID' })
  }
  if (await bcrypt.compare(입력한비번, result.password)) {
    return cb(null, result)
  } else {
    return cb(null, false, { message: '비밀번호 불일치' });
  }
}))

passport.serializeUser((user, done) => {
  process.nextTick(() => {
    done(null, { id: user._id, username: user.username })
  })
})

passport.deserializeUser(async (user, done) => {
  let result = await db.collection('user').findOne({_id : new ObjectId(user.id)})
  delete result.password
  process.nextTick(() => {
    return done(null, result)
  })
})

app.get('/login', (req, res) => {
  res.render('login.ejs')
})

// alert 방식으로 전환하고 싶음....
app.post('/login', (req, res) => {
  passport.authenticate('local', (error, user, info) => {
    if (error) return res.status(500).json(error)
      if (!user) return res.status(401).json(info.message)
      req.logIn(user, (err) => {
        if (err) return next(err)
        res.redirect('/')
      })
  })(req, res)
})

app.get('/alert', (req, res) => {
  res.render('alert.ejs')
})

app.get('/project', (req, res) => {
  res.render('project.ejs')
})

////////////
// 게시판 //
////////////
app.get('/list/:id', async (req, res) => {
  let post_number = req.params.id
  if (req.user) {
    let result1 = await db.collection('post').find().sort({'_id':-1}).toArray()
    let result2 = await db.collection('post').find().sort({'_id':-1}).skip((10 * (post_number-1))).limit(10).toArray();
    res.render('list.ejs', {post : result1, list_page : result2})
  } else {
    res.render('alert.ejs', {error:'로그인하세요'})
  }
})

app.get('/text/:id', async (req, res) => {
  try {
    let id = req.params.id
    let result1 = await db.collection('post').findOne({_id : new ObjectId(id)})
    let result2 = await db.collection('comments').find({text_id : new ObjectId(id)}).toArray()
    res.render('text.ejs', {text : result1, comment : result2})
  } catch (err) {
    console.log(err)
  }
})

app.get('/write', (req, res) => {
  res.render('write.ejs')
})

app.post('/write', async (req, res) => {
  try {
    if (req.body.title && req.body.content) {
      await db.collection('post').insertOne({
        title : req.body.title,
        content : req.body.content,
        user : req.user.nickname,
        userid : req.user.username
      })
      res.redirect('/list/1')
    } else {
      res.render('alert.ejs', {error:'모든 항목을 입력해주세요'})
    }
  } catch(error) {
    console.log(error)
  }
})

app.post('/comment', async (req, res) => {
  await db.collection('comments').insertOne({
    comment : req.body.comment,
    text_id : new ObjectId(req.body.text_id),
    writer : req.user.username,
    nickname : req.user.nickname,
    writerid : new ObjectId(req.user._id)
  })
  res.redirect('back') // 이전페이지 돌아가기
})

app.get('/edit/:id', async (req, res) => {
  try {
    // 파라미터 id를 포함하는 컬랙션의 userid 와 req.user가 다르면 안들여보내줌
    let id = req.params.id
    let result = await db.collection('post').findOne({_id : new ObjectId(id)})
    if (result.userid == req.user.username) {
      res.render('edit.ejs', {edit : result})
    } else {
      res.render('alert.ejs', {error:'글쓴이만 접근 가능합니다.'})
    }
  } catch (err) {
    console.log(err)
  }
})

// 수정
app.post('/edit', async (req, res) => {
  try {
    if (req.body.title && req.body.content) {
      await db.collection('post').updateOne({_id : new ObjectId(req.body.id)}, {$set : {title : req.body.title, content : req.body.content}})
      res.redirect('/list/1')
    } else {
      res.render('alert.ejs', {error:'모든 항목을 입력해주세요'})
    }
  } catch(error) {
    console.log(error)
  }
})

app.get('/playground', (req, res) => {
  res.render('playground.ejs')
})

////////////
// 채팅방 //
///////////
app.get('/chat', async (req, res) => {
  if (req.user) {
    let result = await db.collection('chat').find().sort({_id: -1}).toArray()
    res.render('chat.ejs', {user : req.user, chatdata : result})
  } else {
    res.render('alert.ejs', {error:'로그인하세요'})
  }
})

io.engine.use(sessionMiddleware)

io.on('connection', (socket) => {
  console.log('user connected :', socket.request.session)
  socket.on('disconnect', () => {
    console.log('user disconnected')
  })

  socket.on('ask-join', (data) => {
    socket.join(data)
  })

  socket.on('message', async (data) => {
    await db.collection('chat').insertOne({
      content : data.msg,
      user : data.user,
      time : data.time
    })
    io.to('chat').emit('broadcast', {content : data.msg, user : data.user, time : data.time})
  })
})
