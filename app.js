const express =require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
// const date = require(__dirname + "/date.js");



const app = express();
app.set('view engine', 'ejs');



app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));

mongoose.connect("mongodb://localhost:27017/todolistDB", {useNewUrlParser: true});
const itemsSchema = {
  name: String
}
const Item = mongoose.model("Item",itemsSchema);

const Item1 = new Item({
  name: "Welcome to your toDoList!"
})
const Item2 = new Item({
  name: "Hit the + button to add a new items!"
})
const Item3 = new Item({
  name: "<--Hit this to delete the item!"
})

const defaultItems = [Item1, Item2, Item3];

//Express routing schema
const listSchema = {
  name: String,
  items:[itemsSchema]
};
const List = mongoose.model("List", listSchema);



app.get("/", function(req, res){

    Item.find({},function(err, foundItems){

     if(foundItems.length === 0){
       Item.insertMany(defaultItems, function(err){
         if(err){
           console.log("Error");
         }else {
           console.log("Succesfully Inserted");
         }
       });
       res.redirect("/");
     }else {
         res.render('list', {listTitle: "Today", newListItems: foundItems});
     }
    })
});

//Express Routing
app.get("/:customListName", function(req, res){
  const customListName = _.capitalize( req.params.customListName);
  List.findOne({name: customListName}, function(err, foundList){
    if(!err){
      if(!foundList){
        //Create a new List
        const list = new List({
          name: customListName,
          items: defaultItems
        });
        list.save();
        res.redirect("/" + customListName);
      }else {
        //Show an Existing List
        res.render("list", {listTitle: foundList.name, newListItems: foundList.items})
      }
    }
  });

});

app.post("/", function(req, res){
 const itemName = req.body.newItem;
 const listName = req.body.list;
  const item = new Item({
    name: itemName
  });

  if( listName === "Today"){
  item.save();
  res.redirect("/")
}else {
  List.findOne({name:listName}, function(err, foundList){
    foundList.items.push(item);
    foundList.save();
    res.redirect("/" + listName);
  });
}
});

app.post("/delete", function(req, res){
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

 if(listName === "Today"){
   Item.findByIdAndRemove(checkedItemId, function(err){
     if(!err){
       console.log("Succesfully Deleted");
       res.redirect("/");
     }
   });
 }else {
  List.findOneAndUpdate({name: listName},{$pull: {items:{_id:checkedItemId}}}, function(err, foundList){
    if(!err){
      res.redirect("/" + listName);
    }
  }) ;
 }
});


app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function(){
  console.log("Server is running on port 3000.");
})
