const mongoose = require("mongoose");
mongoose.connect("mongodb://127.0.0.1:27017/foods",function	(error,db) {
	if (error) {
		console.log('Unable to connect to the server. Please start the server. Error:', error);
    } else {
        console.log('Conexion exitosa al servidor  mongo!');    
	}
});


module.exports = mongoose;