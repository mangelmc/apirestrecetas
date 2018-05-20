/*
	Creamos el modelo libro,
	ademas importamos "Schema"  del Modulo mongoose, que nos permitira crear el tipo de dato ObjectId 
	
*/
const mongoose = require("../connect");
const Schema = require("mongoose").Schema;
var libroSchema = {
  	titulo : String,
    paginas : Number,
    //aqui referenciamos a autor desde su modelo y lo cargamos en autor : 
    autor : { type: Schema.ObjectId, ref: "autor"}
};
var libro = mongoose.model("libro", libroSchema);
module.exports = libro;

