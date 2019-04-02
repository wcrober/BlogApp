const express = require('express')
const mustachExpress = require('mustache-express')
const bodyParser = require('body-parser')
const pgp = require('pg-promise')()
const app = express()

const connect = "postgres://localhost:5432/practice"
const db = pgp(connect)

app.use(bodyParser.urlencoded({extended: false}))

app.engine('mustache',mustachExpress())
app.use('/css',express.static('styles'))

app.set('view engine', 'mustache')



app.post('/add-new-post',(req,res) => {
    let title = req.body.title
    let post = req.body.post

    db.one('INSERT into posts(posttitle,post) VALUES($1,$2) RETURNING postid,timestamp;',[title,post])
    .then((data) => {
        //res.redirect('/view-all-posts')
        console.log(data)
        console.log("SUCCESS")
    }).catch(error => console.log(error))
    //res.send('Status 200')
    res.redirect('/view-all-posts')
})

app.get('/add-new-post',(req,res) => {
 res.render('add-new-post')
})


app.post('/delete-post',(req,res) => {
    let postId = parseInt(req.body.postId)

    db.none('DELETE FROM posts WHERE postid = $1',[postId])
    .then(() => {
        res.redirect('/view-all-posts')
    })
})

app.post('/update-post',(req,res) => {
    let post = req.body.post
    let postId = parseInt(req.body.postId)
    

    db.none('UPDATE posts SET post = $1 WHERE postid = $2',[post,postId])
    .then(()=> {
        res.redirect('/view-all-posts')
    })
})

app.get('/view-all-posts',(req,res) => {
    db.any('SELECT postid,timestamp as postdate,posttitle,post FROM posts order by postid desc')
    .then((posts)=> {console.log(posts)
        res.render('view-all-posts',{posts:posts})
    })
})


app.listen(3000,() => {
    console.log("Server is running on port 3000...")
})