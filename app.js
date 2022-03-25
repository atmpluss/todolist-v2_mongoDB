//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const _ = require("lodash");

const date = require(__dirname + "/date.js");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

// const items = ["Buy Food", "Cook Food", "Eat Food"];
// const workItems = [];
mongoose.connect('mongodb://localhost:27017/todolistDB');
const itemschema = mongoose.Schema({
  name:String,
});
const Item =  mongoose.model("Item", itemschema);
const item1 = new Item({
  name:"Welcome to the todo list",
  
});
const item2 = new Item({
  name:"hit the + button to add to the list",
  
});
const item3 = new Item({
  name:"-- Hit this to delete the item",
  
});

defaultItems = [item1, item2,item3];


//first schema
const listschema = mongoose.Schema({
  name:String,
  listItems:[itemschema]
});

//second model
const List =  mongoose.model("List", listschema);




app.get("/", function(req, res) {


  Item.find(function(err,founditems){
  if(err){
      console.log(err);
  }else{
      if(founditems.length===0){
        
        Item.insertMany(defaultItems, function(err) {
            (err)?console.log(err):console.log("inserted default items to DB");
            res.redirect("/")
        });
      } else{
        res.render("list", {listTitle: "Today", newListItems: founditems});
      }
     
      
  
  }
})

  

});


app.get('/:name', function(req, res) {
  // console.log(req.params.name);
  var listname = _.capitalize(req.params.name);
  List.findOne({ name: listname}, function (err, docs) {
    if(err){
      console.log(err);
    }else{
      if(!docs){
        const list = new List({
          name:listname,
          listItems:defaultItems  
        });
        list.save()
        res.redirect('/'+listname)
      }else{
        res.render("list", {listTitle: docs.name, newListItems: docs.listItems});
      }
    }
  });
  
});

app.post("/", function(req, res){

  const NewItemName = req.body.newItem;
  const itemtitle = req.body.list;


  const newItem = new Item({
    name:NewItemName,
  });

  if(itemtitle ==="Today"){
    newItem.save();
    res.redirect("/");
  }else{

    List.findOne({ name: itemtitle}, function(err, docs){
      if(err){
        console.log(err);
      }else{
        docs.listItems.push(newItem);
        docs.save();
        res.redirect("/"+itemtitle);

      } 

    })


    


   
    
    
  }


  
  
});

app.post("/delete", (req, res)=>{
  
  const checkedItemId = req.body.checkbox;
  const listName= req.body.listName;
  console.log(checkedItemId);
  console.log(listName.split(""));

  if (listName==="Today"){
    console.log("heloooo");
    Item.deleteOne({ _id: checkedItemId  }, function(err){
      err?console.log(err):console.log("successfully deleted!")
      res.redirect("/");
    });
    
    
  }
  else{
    List.findOneAndUpdate({name:listName},{$pull:{listItems:{_id:checkedItemId}}},function(err, foundList){
      console.log(foundList);  
      if(!err){
          res.redirect("/"+listName);
        }
    })
    
  }


  

  

  
})

app.get("/work", function(req,res){
  res.render("list", {listTitle: "Work List", newListItems: workItems});
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
