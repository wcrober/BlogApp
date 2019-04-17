const express = require('express')
const mustachExpress = require('mustache-express')
const bodyParser = require('body-parser')
const pgp = require('pg-promise')()
const app = express()
const bcrypt = require('bcrypt')
const path = require('path')
const Post = require('./post')
const Comment = require('./comments')
const connect = "postgres://localhost:5432/practice"
const db = pgp(connect)
const salt = 10
const VIEWS_PATH = path.join(__dirname, '/views')


app.use(bodyParser.urlencoded({extended: false}))
app.engine('mustache',mustachExpress(VIEWS_PATH + '/partials'))
app.use('/css',express.static('styles'))
app.set('view engine', 'mustache')


let session = require('express-session')


app.use(session({
    secret: 'Twas brillig, Raven quotes',
    resave: false,
    saveUninitialized: true
}))



// ADD POST
app.get('/add-post',(req,res) => {
    res.render('add-post')
   })


   app.post('/add-post',(req,res) => {
    let title = req.body.title
    let post = req.body.post

   db.none('INSERT into posts(posttitle,post) VALUES($1,$2)',[title,post])
    .then(() => {
        res.redirect('/home')
    })
})



//home
app.get('/home',(req,res) => {
    // My where clause mimmiks primary and foreign key relationship
    //db.any('select p.* c.* from posts p, comments c;')
    db.any('select p.*, c.comment from posts p, comments c where p.postid = c.post_id order by p.timestamp desc')
    .then((posts)=> {
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

//app.post('/add-comment',(req,res) => {
//    let comments = req.body.comments
//    let postid = req.body.postId
//    db.any('Insert into comments(comment,post_id) VALUES($1, $2)',[comments,postid])
//    .then((comments) => {
//        console.log(comments)
//        res.redirect('/view-all-posts',{comments:comments})
//    }).catch(error => console.log(error))
//    res.send('Status 200')   
//})




/*
app.get('/view-all-posts',(req,res) => {
    // My where clause mimmiks primary and foreign key relationship
    //db.any('select p.* c.* from posts p, comments c;')
    db.any('SELECT postid,timestamp as postdate,posttitle,post FROM posts order by postid desc')
    .then((posts)=> {
        res.render('view-all-posts', {posts:posts})
        console.log(posts)
    })
})





app.get('/home', (req,res)=> {
    db.any('select * from posts;')
    .then((post) => {
        res.render({posts:post})
    }
    )
})


app.post('/add-new-post',(req,res) => {  
    let posts = []
    let postID = req.body.postID 
})db.none
    .then()posts.forEach((item) => {
        //if the post does not exist then ad it to the new_posts array
        if(new_posts.length == 0 ) {
            let post = new Post(item.posttitle,item.post,item.postid,item.timestamp)
            let comment = new Comment(item.comment,item.post_id)
            post.addComment(comment)
            new_posts.push(post)
        // Else if the post exist in the new_posts array so add the comment to it.
        } else {
            let persistedPost = new_posts.find((post) => 
                post.postid == item.postid)
            if(persistedPost) {
                let comment = new Comment(item.comment,item.post_id)
                persistedPost.addComment(comment)
        // Or else the post didn't exist so add it along with it's comment to the new_posts array
        } else {
                let post = new Post(item.posttitle,item.post,item.postid)
                let comment = new Comment(item.comment,item.post_id)
                post.addComment(comment)
                new_posts.push(post)
                }
            }
        })
        res.render('view-all-posts',{new_posts:new_posts})
        console.log("These are the new posts")
        console.log(new_posts)
    })








app.get('/register',(req,res) => {
    res.render('register')
})


app.post('/register',(req,res) => {
    let username = req.body.username
    let password = bcrypt.hashSync(req.body.password, salt)
    let user = {username:username, hash:password}
    users.push(user)
    res.redirect('/login')
})


app.get('/login',(req, res) => {
    res.render('login')
})



app.post('/login', (req, response) => {
    let username = req.body.username
    let persistedUser = users.find((user) => {
      return user.username == username
    })
    bcrypt.compare(req.body.password, persistedUser.hash, function(err, res) {
        if(res) {
          if(req.session){
            req.session.username = username
            response.redirect('/home')
          }
        } else {
          console.log('invalid crendentials')
        }
      })
  })

  app.post('/signout',(req,res) => {
      res.redirect('/')
  })

  app.get('/',(req,res) => {
      res.render('main')
  })





/*
app.post('/add-comment',(req,res) => {
    let comments = req.body.comments
    let postid = req.body.postId
    db.any('Insert into comments(comment,post_id) VALUES($1, $2)',[comments,postid])
    .then((comments) => {
        console.log(comments)
        res.redirect('/view-all-posts',{comments:comments})
    }).catch(error => console.log(error))
    res.send('Status 200')   
})



app.get('/add-comment',(req,res) => {
    res.render('/add-comment')
   })



app.post('/add-comment',(req,res) => {
    let comments = req.body.comments
    let postid = parseInt(req.body.postId)
    //let commentID = parseInt(re.body.post_id)

    db.none('INSERT into comments(comment,post_id) VALUES($1, $2)',[comments,postid],)
    .then((data) => {
        console.log(data)
    res.redirect('/add-comment')
}).catch(error => console.log(error))
})









app.listen(3000,() => {
    console.log("Server is running on port 3000...")
})

app.post('/view-comments',(req,res) => {  
    let posts = []
    let postID = req.body.postID 
    db.any('select p.*, c.post_id from posts p, comments c where p.postid = c.post_id')
    .then((data) => {
        data.forEach((item) => {
        //if the post does not exist then add it to the new_posts array
        if(posts.length == 0 ) {
            let post = new Post(item.posttitle,item.post,item.postid,item.timestamp)
            let comment = new Comment(item.comment,item.post_id)
            post.comments.push(comment)
            posts.push(post)
        // Else if the post exist in the new_posts array so add the comment to it.
        } else {
            let persistedPost = posts.find((post) => {
              return  post.postid == item.postid
        })
            if(persistedPost) {
                let comment = new Comment(item.comment,item.post_id)
                persistedPost.push(comment)
        // Or else the post didn't exist so add it along with it's comment to the new_posts array
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

/*
*/

