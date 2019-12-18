var http=require('http');
var path=require("path");
var formidable=require('formidable');
var express=require("express");
var hbs = require('hbs');
var mongo=require('mongodb').MongoClient;
var ObjectId=require('mongodb').ObjectID;
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var url = "mongodb://localhost:27017/";

var app=express();
app.use(cookieParser());
app.set('view engine', 'hbs');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use('/assets',express.static(__dirname + '/public'));

app.get('/',function(req,res)
{
	res.sendFile(path.join(__dirname+'/start.html'));
});

app.post("/Signup",function(req,res)
{
	res.sendFile(path.join(__dirname+'/signup.html'));
});


app.post("/Login",function(req,res)
{
	res.sendFile(path.join(__dirname+'/login.html'));
});

app.post("/VerifyUser",function(req,res)
{
	
		var Data={email:req.body.email,password:req.body.password};

		mongo.connect(url,function(err,db)
		{
			var database=db.db('mydb') ;
			database.collection('user').findOne({email:req.body.email,password:req.body.password},{},function(err,result)
				{
				if(result)
				{
					res.cookie('id',result._id, { maxAge: 900000, httpOnly: true });
						if(result.role=='seller'||result.role=='Seller')
						{
							res.redirect("/sellerProducts");
						
						}
						if(result.role=='buyer'||result.role=='Buyer')
						{

								res.render("/products");
						}
}
	
		}
	);

});
});
app.post("/AddUser",function(req,res)
{

		var Data={Name:req.body.UserName,email:req.body.email,password:req.body.password,role:req.body.role};
		console.log(req.body.UserName);
		mongo.connect(url,function(err,db)
		{
			var database=db.db('mydb') ;
			database.collection('user').insertOne(Data,function(err,result)
				{
					if(result)
					{
						res.cookie('id',result._id, { maxAge: 900000, httpOnly: true });
						if(req.body.role=='seller'||req.body.role=='Seller')						{

								res.redirect("/sellerProducts");
						
						}
						else if(req.body.role=='buyer'||req.body.role=='Buyer')
						{
								res.redirect("/products");
						}
					}
			});
			

});

});


app.get('/products',function(req,res)
{
mongo.connect(url,function(err,db)
		{
			var database=db.db('mydb') ;
			database.collection('product').find().toArray(function(err,result)
				{
					res.render('Buyer',{
     					 results: result
    					});
				});

		});
});

app.get('/sellerproducts',function(req,res)
{

mongo.connect(url,function(err,db)
		{
			var cookie=req.cookies.id;
			var database=db.db('mydb') ;
			database.collection('product').find({user:cookie}).toArray(function(err,result)
				{
					res.render('Seller',{
     					 results: result
   					 });
	
				});
		});
});

app.post('/addItem',function(req,res)
{
		var cookie=req.cookies.id;
		
		var prod={ProductName:req.body.p_name,description:req.body.des,price:req.body.price,category:req.body.category,user:cookie};
		mongo.connect(url,function(err,db)
		{
			var database=db.db('mydb') ;
			database.collection('product').insertOne(prod,function(err,result)
				{
		if(result)
		console.log("data entered");

		res.redirect("/sellerProducts");
	
		});
		});
});
app.post('/deleteItem',function(req,res)
{
		var cookie=req.cookies.id;
		mongo.connect(url,function(err,db)
		{
			var database=db.db('mydb') ;
			database.collection('product').deleteOne({_id: ObjectId(req.body._id)},function(err,result)
				{
		console.log("deleted");
		if(err)
		throw err;
		res.redirect("/sellerProducts");
		}
	);
});
});
app.post('/updateItem',function(req,res)
{
		var cookie=req.cookies.id;
		
		console.log(req.body._id);
		var Data={ProductName:req.body.p_name,description:req.body.des,price:req.body.price,category:req.body.category};
		
		mongo.connect(url,function(err,db)
		{
			var database=db.db('mydb') ;
			database.collection('product').update({_id: ObjectId(req.body._id)},Data,function(err,result)
				{
				if(err) throw err;
				mongo.connect(url,function(err,db)
				{
				res.redirect("/sellerProducts");
		});
	
				});
		});
});


app.listen(8080);


















