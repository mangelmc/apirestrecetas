const mongoose = require("../connect");
const Schema = require("mongoose").Schema;
var usuarioSchema = {
  alias : String, 
  nombre : String,
  mensaje : [{type : Schema.ObjectId,ref : "mensaje"}],
  //mensaje es un array de ids, lo que indica que se puede referenciar a mas de un mensaje rel 1 a n
 };
var usuario = mongoose.model("usuario", usuarioSchema);
module.exports = usuario;