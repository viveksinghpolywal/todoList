//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const { default: mongoose } = require("mongoose");
const date = require(__dirname + "/date.js");
const _=require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://viveksinghpolywal:ExSHfyVrVm6t0dLW@viveksinghpolywal.xprirlr.mongodb.net/todolistDB");
const itemsSchema={
  name: String,

};
const Item = mongoose.model("Item", itemsSchema,"Item");

const item1=new Item({
  name: "Welcome to your todolist!"
});
const item2=new Item({
  name:"Hit the + button to aff a new item."
});
const item3=new Item({
  name: "<-- Hit this to delete an item"
});

const defaultItems=[item1,item2,item3];
const listSchema={
  name:String,
  items:[itemsSchema]
};

const List=mongoose.model("List",listSchema,"List");


app.get("/", function(req, res) {
  async function getItems(){
    const Items = await Item.find({});
    return Items;
  }
    getItems().then(function(foundItems){
      if(foundItems.length===0){
        Item.insertMany(defaultItems/*,function(err){
          if(err){console.log(err);}
          else{console.log("Success");}
        }*/);
        res.redirect("/");
      }
      else{
      res.render("list", {listTitle: "Today", newListItems: foundItems});}
});
});

app.get("/:customListName",function(req,res){
  const customListName=_.capitalize(req.params.customListName);
  List.findOne({name:customListName}).then(function(foundList){
    if(!foundList){
      //Create a new list
      const list=new List({
        name:customListName,
        items:defaultItems
      });
      list.save();
      res.redirect("/"+customListName);
    }
    else{
      //Show an existing list
      res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
    }
  }).catch(function(err){console.log(err);});

})

app.post("/", function(req, res){

  const itemName=req.body.newItem;
  const listName=req.body.list;
  const item =new Item({
    name:itemName
  });
  // item.save();
  // res.redirect("/");
  if(listName==="Today"){
  item.save();
  res.redirect("/");
} 
  else{
  List.findOne({name:listName}).then(function(foundList){
    foundList.items.push(item);
    foundList.save();
    res.redirect("/"+listName);
  });
}
});
app.post("/delete",function(req,res){
  const checkedItemId=req.body.checkbox;
  const listName=req.body.listName;
  if (listName==="Today"){
    Item.findByIdAndDelete(checkedItemId).then(function (models) {
      console.log(models);
    })
    .catch(function (err) {
      console.log(err);
    });
      // Item.findByIdAndDelete(checkedItemId,(err)=>{
      //   if(!err){console.log("Success");}
      // });
      res.redirect("/");
  }
  else{
    List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItemId}}}).then(function(){
      res.redirect("/"+listName);
      // if(!err){
      //   res.redirect("/"+listName);
      // }
    }).catch(function(err){console.log(err);});
  }

});

app.get("/work", function(req,res){
  res.render("list", {listTitle: "Work List", newListItems: workItems});
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
