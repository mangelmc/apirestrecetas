const mongoose = require("../connect");
var ingredientSchema = {
  name : String, 
  kcal : Number,
  peso : Number
};
var ingredient = mongoose.model("ingredient", ingredientSchema);
module.exports = ingredient;