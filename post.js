

class Post {
    constructor(posttitle,post,postid,timestamp){
        this.posttitle = posttitle
        this.post = post
        this.postid = postid
        this.timestamp = timestamp
        this.comments = []
    }
}
module.exports = Post