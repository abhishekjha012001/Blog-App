let express = require("express"),
    methodOverride = require("method-override"),
    bodyParser = require("body-parser"),
    mongoose = require("mongoose"),
    expressSanitizer = require("express-sanitizer"),
    app = express();

//APP CONFIG
mongoose.connect('mongodb://localhost/restful_blog_app', { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true});
app.use(bodyParser.urlencoded({extended: true}));
app.use(expressSanitizer());
app.use(express.static("public"));
app.use(methodOverride("_method"));

//MONGOOSE CONFIG
let blogSchema = mongoose.Schema({
    title: String,
    image: String,
    body: String,
    created: {type: Date, default:Date.now}
});

let Blog = mongoose.model("Blog",blogSchema);

//ROUTES
//HOME PAGE
app.get("/",function(req,res){
    res.redirect("/blogs");
});

//INDEX
app.get("/blogs",function(req,res){
    Blog.find({},function(err,allBlogs){
        if(err)
            console.log(err);
        else
            res.render("index.ejs",{blogs:allBlogs});
    });
});

//NEW
app.get("/blogs/new",function(req,res){
    res.render("new.ejs");
});

//CREATE
app.post("/blogs",function(req,res){
    let blog = req.body.blog;    
    blog.body = req.sanitize(req.body.blog.body);
    Blog.create(blog,function(err,newBlog){
        if(err)
            res.redirect("/blogs/new");
        else
            res.redirect("/");
    });
});

//SHOW
app.get("/blogs/:id",function(req,res){
    let id = req.params.id;
    Blog.findById(id,function(err,blog){
        if(err)
            console.log(err);
        else {
            res.render("show.ejs",{blog:blog});
        }
    });
});

//EDIT
app.get("/blogs/:id/edit",function(req,res){
    Blog.findById(req.params.id,function(err,foundBlog){
        if(err){
            res.render("/blogs");
        }
        else{
            res.render("edit.ejs",{blog:foundBlog});
        }
    })
});

//UPDATE
app.put("/blogs/:id",function(req,res){
    let blog = req.body.blog;
    blog.body = req.sanitize(req.body.blog.body);
    Blog.findByIdAndUpdate(req.params.id,req.body.blog,function(err,updatedBlog){
        if(err){
            res.redirect("/blogs");
        }
        else{
            res.redirect("/blogs/"+req.params.id);
        }
    });
});

//DELETE
app.delete("/blogs/:id",function(req,res){
    Blog.findByIdAndRemove(req.params.id,function(err){
        if(err)
            res.redirect("/blogs");
        else
            res.redirect("/blogs");
    })
});

//LISTEN
app.listen(3000,function(){
    console.log("SERVER HAS STARTED");
});