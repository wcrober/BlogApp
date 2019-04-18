const express = require('express')
const mustachExpress = require('mustache-express')
// Body parser is used to parse the request from the body of the html/mustache page
const bodyParser = require('body-parser')
// Instance of pg-promise library used to take values from end-point/routes and have it go to our db. It is going to return a function ()
const pgp = require('pg-promise')()
const app = express()
// Package for hashing passwords
const bcrypt = require('bcrypt')
// path is used below fo the VIEWS PATH to find views folder
const path = require('path')
const Post = require('./post')
const Comment = require('./comments')
// pgp requires this to connect to the db
const connect = "postgres://localhost:5432/practice"
// Create an instance of the connection string for pgp to use
const db = pgp(connect)
// Will add 10 salt rounds to the hash to make it harder to reverse engineer. The larger the number the longer it takes to create the hash.
const saltRounds = 10
// This is telling mustache express where it can find the views folder. join current project directory and joining it with the views folders
const VIEWS_PATH = path.join(__dirname, '/views')
// Used to keep track of a user session. A cookie
const session = require('express-session')

// This tells bodyParser what kinds of bodies it will be parsing. extended false means cant pass hyerckey formated data
app.use(bodyParser.urlencoded({extended: false}))
// Configure view engine
app.engine('mustache',mustachExpress(VIEWS_PATH + '/partials', '.mustache'))
app.set('views',VIEWS_PATH)
app.set('view engine', 'mustache')


app.use('/css',express.static('styles'))

// Register the middleware
app.use(session({
    // secret this is the salt that we gonna pass in. Make it any random characters if you like or some non dictionary word
    secret: 'klasjdfas',
    // The values in our session are changing
    resave: false,
    // Means should I create a session if user put nothing in it
    saveUninitialized: false
}))





// Routes are end-points or sometimes called actions

//REGISTER
app.get('/register',(req, res) => {
    res.render('register')
})

app.post('/register', (req, res) => {

    let username = req.body.username
    let password = req.body.password

    db.oneOrNone("select userid from users where username = $1",[username])
    //We get access to the user with the .then((user)
    .then((user) => {
    // If user exist or is true meaning it's not undefined
        if(user) {
            res.render('register',{message:"User name already exist!"})
        } else {
    // Insert into users db and return userid. We can do something with the userid now or not since no we can use db.none
            //db.none("insert into users(username,password) VALUES($1, $2)", [username,password])
            // the .then() is empty because it is not returning anything since we used db.none
            //.then(() => {
            // Should be sending the user to a page at this point.
            //    res.send('Success')
            //})
            bcrypt.hash(password,saltRounds,function(error,hash){
                // if error doesn't exist or is null
                if(error == null){
                    db.none('insert into users(username,password) VALUES($1, $2)', [username, hash])
                    .then(() => {
                        res.send('SUCCESS')
                    })
                }
            })
        }
    })
})


//LOGIN
app.get('/login', (req, res) => {
    res.render('login')
})


app.post('/login', (req,res) => {
    let username = req.body.username
    let password = req.body.password

    db.oneOrNone('select userid,username,password from users where username = $1',[username])
    // the select should return a user if one already exist. This also measn if user is null then perform what is in the function which is currently empty
    .then((user) => { 
        if(user){ // check for the user password compare the password passed in with user.password which is the result of user from the db.oneOrNone select statement and the last arg is a function which returns an error or result
            bcrypt.compare(password,user.password,function(error,result){
                //if the result is true then do the following
                if(result){

                    //put username and userId in the session. Anything can go here but this is how you can refer to the user on different screens and pages
                    if(req.session){
                        // Created a user attribute which holds an object which consist of userID and username
                        req.session.user = {userID: user.userid, username: user.username}
                    }
                       
                    res.redirect("/add-post")
                } else{// if the password does not match
                    res.render('login', {message: "Invalid Login"})
                }
            })
        } else {// if the user does not exist
            res.render('login', {message: "Invalid Login"})
        }
    })
})



// ADD POST
app.get('/add-post',(req,res) => {
    res.render('add-post',{username:req.session.user.username})
   })


app.post('/add-post',(req,res) => {
    let title = req.body.title
    let post = req.body.post

   db.none('INSERT into posts(posttitle,post) VALUES($1,$2)',[title,post])
    .then(() => {
        res.redirect('/home')
    })
})


app.post('/view-comment',(req,res) => {
    let posts = []
    let postId = parseInt(req.body.postId)
    db.any("select p.*, c.comment from posts p, comments c where p.postid = c.post_id order by p.timestamp desc;")
        .then((data) => {
    data.forEach((item) => {
        //if the post does not exist then ad it to the new_posts array
        if(posts.length == 0 ) {
            let post = new Post(item.posttitle,item.post,item.postid,item.timestamp)
            let comment = new Comment(item.comment,item.post_id)
            post.comments.push(comment)
            posts.push(post)
        //Else if the post exist in the posts array so add the comment to it.
        } else {
            let persistedPost = posts.find((post) => {
                return post.postid == item.postid
            })
            if(persistedPost) {
                let comment = new Comment(item.comment,item.post_id)
                persistedPost.comments.push(comment)
        //Or else the post didn't exist so add it along with it's comment to the new_posts array
        } else {
                let post = new Post(item.posttitle,item.post,item.postid)
                let comment = new Comment(item.comment,item.post_id)
                post.comments.push(comment)
                posts.push(post)
                }
            }
        })
        console.log(posts)
        res.render('home',{posts:posts})
    })
})



//home
app.get('/home',(req,res) => {
    // My where clause mimmiks primary and foreign key relationship
    //db.any('select p.* c.* from posts p, comments c;')
    db.any('select p.*, c.comment from posts p, comments c where p.postid = c.post_id order by p.timestamp desc')
    .then((posts)=> {
        // Render the home page and pass in the {posts:posts} object
        res.render('home', {posts:posts})
        console.log(posts)
    })
})



// Delete Post
app.post('/delete-post',(req,res) => {
    let postId = parseInt(req.body.postId)
    db.none('DELETE FROM posts WHERE postid = $1',[postId])
    .then(() => {
        res.redirect('/home')
    }).catch(error => console.log(error))
})


// Add Comment
app.post('/add-comment',(req,res) => {
    let comments = req.body.comments
    let postid = req.body.postId
    db.none('Insert into comments(comment,post_id) VALUES($1, $2)',[comments,postid])
    .then(() => {
        res.redirect('/home')
    }).catch(error => console.log(error))
   })

// Update Post
   app.post('/update-post',(req,res) => {
    let post = req.body.post
    let postId = parseInt(req.body.postId)
    db.none('UPDATE posts SET post = $1 WHERE postid = $2',[post,postId])
    .then(()=> {
        res.redirect('/home')
    })
})


app.listen(3000, () => {
    console.log("The server is up on port 3000")
})

