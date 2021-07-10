const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const _ = require('lodash');
const date = require(__dirname + '/date.js');
const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://admin-shawn:passmore@cluster0.hqjap.mongodb.net/pulse', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const menuSchema = new mongoose.Schema({
    name: String,
    side: String,
    price: String,
    status: String,
    meal: String
});

const MenuItem = mongoose.model('MenuItem', menuSchema);

const postSchema = new mongoose.Schema({
    title: String,
    author: String,
    category: String,
    status: String,
    image: String,
    content: String,
    comments: Number,
    date: String
});

const Post = mongoose.model('Post', postSchema);

const categorySchema = new mongoose.Schema({
    title: String
});

const Category = mongoose.model('Category', categorySchema);

const app = express();
app.use(bodyParser.urlencoded({
    extended: true
}));
app.set('view engine', 'ejs');
app.use(express.static('public'));

app.route('/admin/menu').get((req,res) => {
    const option = req.query.option;
    const meal = _.capitalize(req.query.meal);

    MenuItem.find({meal: meal}, (err, menuItems) => {
        if(!err) {
            res.render('admin/menu', {option: option, meal: meal, menuItems: menuItems});
        }
    })

    
}).post((req, res) => {
    
    const menuItem = new MenuItem({
        name: req.body.item_name,
        side: 'with ' + req.body.side,
        price: req.body.price,
        status: 'draft',
        meal: req.body.meal
    });

    const meal = _.lowerCase(req.body.meal);
    console.log(req.body);

    menuItem.save();
    res.redirect('/admin/menu?option=' + meal + '&meal=' + meal);

})

app.route('/admin/posts').get((req, res) => {
    const option = req.query.option;
    if (option == 'view_all_posts') {
        Post.find({}, (err, posts) => {
            if (!err) {
                if (posts) {
                    res.render('admin/posts', {
                        option: option,
                        posts: posts
                    });
                }
            } else {

            }
        });

    } else if (option == 'add_post') {
        Category.find({}, (err, categories) => {
            res.render('admin/posts', {
                option: option,
                categories: categories
            });
        })
        
    } else if (option == 'edit_post') {
        Post.findById(req.query.id, (err, post) => {
            if (!err) {
                if (post) {
                    console.log(post);
                    res.render('admin/posts', {
                        option: option,
                        post: post
                    });
                }
            } else {
                console.log(err);
            }
        });
    }

}).post((req, res) => {
    const post_title = req.body.post_title;
    const post_author = req.body.post_author;
    const post_category = req.body.post_category;
    const post_content = req.body.post_content;

    console.log(req.body);

    const post = new Post({
        title: post_title,
        author: post_author,
        category: post_category,
        status: 'draft',
        image: '1.jpg',
        content: post_content,
        comments: 0,
        date: date.getDate()
    });

    post.save();
    res.redirect('/admin/posts?option=view_all_posts');
});

app.route('/admin/posts/update/:id').post((req, res) => {
    
    const post_title = req.body.post_title;
    const post_author = req.body.post_author;
    const post_category = req.body.post_category;
    const post_content = req.body.post_content;

    Post.updateOne({
        _id: req.params.id
    }, {
        title: post_title,
        author: post_author,
        category: post_category,
        status: 'draft',
        image: '2.jpg',
        content: post_content,
        comments: 0,
        date: date.getDate()
    }, {
        upsert: true
    }, err => {
        if (!err) {
            console.log("Successfully Updated Post");
            res.redirect('/admin/posts?option=view_all_posts');
        } else {
            console.log(err);
        }
    });
});

app.post('/admin/posts/delete/:id', (req, res) => {
    Post.findByIdAndDelete(req.params.id, err => {
        console.log(err);
    })

    res.redirect('/admin/posts?option=view_all_posts');
});

app.post('/admin/posts/publish/:id', (req, res) => {
    Post.updateOne({
        _id: req.params.id
    }, {
        status: 'published'
    }, err => {
        console.log(err);
    });

    res.redirect('/admin/posts?option=view_all_posts');
});

app.post('/admin/posts/draft/:id', (req, res) => {
    Post.updateOne({
        _id: req.params.id
    }, {
        status: 'draft'
    }, err => {
        console.log(err);
    });

    res.redirect('/admin/posts?option=view_all_posts');
});


app.get('/admin', (req, res) => {
    res.render('admin/index');
});

app.route('/admin/categories').get((req, res) => {
    Category.find({}, (err, categories) => {
        res.render('admin/categories', {categories: categories});
    });
    
}).post((req,res) => {
    
    const category = new Category({
        title: req.body.cat_title
    });
    console.log(req.body.cat_title);

    category.save();
    res.redirect('/admin/categories');
});

app.post('/admin/categories/delete/:id', (req, res) => {
    Category.findByIdAndDelete(req.params.id, err => {
        if (err) {
            console.log(err);
        }

        res.redirect('/admin/categories');
    });
})

app.get('/', (req, res) => {
    MenuItem.find({}, (err, menuItems) => {
        if(!err) {
            res.render('index', {menuItems: menuItems});
        }
    });
    
});

app.get('/about', (req, res) => {
    res.render('about');
});

app.get('/menu', (req, res) => {
    MenuItem.find({}, (err, menuItems) => {
        if(!err) {
            res.render('menu', {menuItems: menuItems});
        }
    });
});

app.get('/blog', (req, res) => {
    Post.find({}, (err, posts) => {
        if (!err) {
            if(posts) {
                Category.find({}, (err, categories) => {
                    if(!err) {
                        res.render('blog', {posts: posts, categories: categories});
                    }
                });                
            }
        } else {
            
        }
    });
    
});

app.get('/contact', (req, res) => {
    res.render('contact');
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 8000;
}

app.listen(port, () => {
    console.log('Server has started!');
});