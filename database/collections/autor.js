/*
Creamos el modelo Autor
NOTA : A este modelo se hara referencia desde libro
*/
const mongoose = require("../connect");
var autorSchema = {
  nombre : String, 
  biografia : String,
  nacionalidad : String,
  fechaNacimiento : Date
  
};
var autor = mongoose.model("autor", autorSchema);
module.exports = autor;