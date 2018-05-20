const mongoose = require("../connect");
const Schema = require("mongoose").Schema;
var mensajeSchema = {
  texto : String, 
  usuario : {type : Schema.ObjectId,ref : "usuario"},
  //Aqui referenciamos al usuario que hizo el mensaje relacion 1 a 1
};
var mensaje = mongoose.model("mensaje", mensajeSchema);
module.exports = mensaje;