var express = require('express');
var router = express.Router();
var _ = require("underscore");

var Recipe = require("../../../database/collections/recipe");
var Ingredient = require("../../../database/collections/ingredient");
//importamos los modelos libro y autor
var Autor = require("../../../database/collections/autor");
var Libro = require("../../../database/collections/libro");
//importamos los modelos usuario y mensaje
var Usuario = require("../../../database/collections/usuario");
var Mensaje = require("../../../database/collections/mensaje");
/*NOTA : Se habia mencionado que el nombre de las colecciones generadas en mongo desde mongoose
 es el mismo nombre del modelo + "s". Ej. modelo "autor" => coleccion "autors"*/

//Un pequeño help us
//funcion que permite controlar con Regex que el id cumpla con el formato ObjectId de mongo
router.param(function(param,validator){
  return function(req,res,next,val){    
    //hacemos la validacion con  .test() propio de regex y comparamos
    if (validator.test(val) == true) {
      next();
    }else{
      //si no cumple devolvemos la respuesta de error
      res.status(400).json({error : "El id " + val + " , No cumple con el formato requerido"});
    }
  }
});
//Aqui creamos el parametro id y le pasamos el patron que debe cumplir
router.param('id',/^[a-z0-9]{24}$/);
//tambien podemos definir nuestros propios params cons sus validaciones  : router.param('param',validacion);
//Y ahora con solo poner :id a nuestras rutas estaremos controlando los ids que les pasemos como parametro
// Ya no tendremos que estar poniendo el patron a cada ruta :v

//ruta para listar los autores
router.get("/autores", (req, res, next) => {
  Autor.find({}).exec( (error, docs) => {
    //console.log(docs)
    res.status(200).json(docs);
  })
});
//ruta para listar los libros mas la informacion completaa del autor
router.get("/libros", (req, res, next) => {
  //aqui utilizamos populate() para poblar el parametro "autor" con toda la info acerca del mismo
  Libro.find({}).populate("autor").exec( (error, docs) => {
    //checkeamos hay error de algun tipo 
    if (error) {
      //devolvemos el error;
      res.status(400).json({error : error});return;
    }else{
      res.status(200).json({
        /*
          Podriamos devolver los documentos tal cual los recibimos;
          pero tb podemos remapearlos (si vale el termino) segun nuestros requerimientos
          Por ej. : usamos la funcion map() de javascript ;
        */
        libros : docs.map(doc => {
          return {
            //aqui reesctructuramos cada documento 
            detalleLibro : {
              titulo : doc.titulo,
              paginas : doc.paginas
            },
            detalleAutor : doc.autor,
            //Aqui tambien podemos devolver algun tipo de mensaje u otro que veamos conveniente
            status : 'OK'
          }
        })
      });
    }
  })
    
});
//Ruta para listar solo un libro
router.get("/libros/:id", (req, res, next) => {
  //obtenemos la url de la ruta "/libros/:idLibro"
  var url = req.url;
  //extraemos el id de url 
  var id = url.split("/")[2];//url.split() == ['','libros',':idLibro'] 
  //Hacemos la busqueda y la poblamos con los datos del autor
  Libro.findOne({_id : id}).populate("autor").exec( (error, doc) => {
    //verificamos la existencia de algun tipo de error 
    if (error) {
      res.status(400).json({error : error});return;
    }
    //Verificamos que se haya encontrado el documento de la coleccion
    if (doc != null) {
      //devolvemos la consulta
      var options ={
          weekday:'long',year:'numeric',month:'long',day:'numeric'
      }
      //aqui jugamos un poco con javascript : fecha
      var fecha = doc.autor.fechaNacimiento;
      //N° 1 : Se parsea la fecha a formato legible ejemplo : "Lunes, 5 de Mayo de 1999"
      fechaToDateString = fecha.toLocaleDateString('es-ES',options);
      //N° 2 : Se extrae la fecha como cadena 
      fechaToString = fecha.toString();

      res.status(200).json({
        /*Podrimaos devolver como parametro solo doc => "res.status(200).json(doc);"
          pero tambien podemos reestructurar nuestro documento segun veamos conveniente
          por ejemplo : 
        */
        //redefinimos el documento a nuestro antojo :)
        libro : {
          titulo : doc.titulo,
          paginas : doc.paginas
        },
        autor : {
          nombre : doc.autor.nombre,
          //notese que se cambio el nombre del campo para mostrar otro => .....
          fechaToDateString :  fechaToDateString,//mmm.. que raro.. en MeteorJS me muestra como "Lunes, 9 de Mayo de 1999" vaya... haber si lo arreglan y luego me dicen q pso 
          fechaToString : fechaToString,//creo que eso se ve mejor :) 
          fecha : doc.autor.fechaNacimiento 
        },

        //podemos definir de manera arbitraria lo que veamos conveniente y/o necesario po ej
        request : {
          type : "GET",
          url : "http://localhost:7777/api/v1.0/libros/" + doc._id
        }
        //
      });
    }else{
      //en el caso de no encontrase el doc :
      res.status(200).json({error : 'El libro no existe'});
    }
    
  })
});

//ruta para insertar un nuevo autor
router.post("/autores", (req, res) => {
  //se obviaron los controles alv
  var autor = {
    nombre :  req.body.nombre, 
    biografia :  req.body.biografia,
    nacionalidad :  req.body.nacionalidad,
    fechaNacimiento : req.body.fechaNacimiento
  };
  var autorData = new Autor(autor);
  autorData.save().then( () => {
    
    res.status(200).json({
      "msn" : "autor Registrado con exito "
    });
  }).catch(err => {
    //console.log(err);
    res.status(500).json({
      error : err
    });
  });
});
router.post("/libros", (req, res) => {
  //Aca faltaria los controles 
  var libro = {
    titulo: req.body.titulo,
    paginas: req.body.paginas,    
    autor: req.body.autor
    
  };
  var libroData = new Libro(libro);
  libroData.save().then( () => {
    res.status(200).json({
      "msn" : "libro Registrado con exito "
    });
  });
});

/*
  Aqui un ejemplo de como relacionar mutuamente dos colecciones 
  No muy recomendable pero en el caso de que lo necesiten 
*/
//ruta para listar los usuarios
router.get("/usuarios", (req, res, next) => {
  Usuario.find({}).populate("mensaje").exec( (error, docs) => {
    //console.log('error' || docs[0].populated("mensajes"));
    res.status(200).json(docs);
  })
});
//ruta para leer los mensajes 
router.get("/mensajes", (req, res, next) => {
  //
  Mensaje.find({}).populate("usuario").exec( (error, docs) => {
    res.status(200).json({
      mensajes : docs.map(doc => {
        return  {
          _id : doc._id,
          texto : doc.texto,
          request : {
            tipo : "GET",
            link : "http://localhost/api/v1.0/" + doc._id,
          },
          usuario : doc.usuario
        }
      })
    });
  })
});
//En los ejemplos de arriba se puede notar que se esta usando populate() en ambas consultas
//ruta para insertar usuarios
router.post("/usuarios", (req, res) => {
  var usuario = {
    alias :  req.body.alias, 
    nombre :  req.body.nombre,
    mensaje : req.body.mensajes,
  };
  var usuarioData = new Usuario(usuario);
  usuarioData.save().then( (usuarioData) => {
    //content-type
    res.status(200).json({
      "msn" : "usuario Registrado con exito",
      datos : usuarioData
    });
  }).catch(err => {
    res.status(500).json({
      error : err
    });
  });
});
//ruta para insertar mensajes
router.post("/mensajes", (req, res) => {
  var mensaje = {
    texto :  req.body.texto, 
    usuario :  req.body.idUsuario,
  };
  var mensajeData = new Mensaje(mensaje);

  mensajeData.save().then( () => {
    //content-type
    res.status(200).json({
      "msn" : "mensaje Registrado con exito "
    });
  }).catch(err => {
    //console.log(err);
    res.status(500).json({
      error : err
    });
  });
});
/* 
  Analizando las rutas POST de arriba se podra notar 
  que no se puede insertar todos los campos porque ambas colecciones dependen una de la otra
  Se puede arreglar con un pequeño control para actualizar el documento de usuarios una vez se inserte en mensajes y bicerversa
  !!!.. Por eso no se recomienda mucho, lo cual no quiere decir que no funcione correctamente 
*/

//actualizar  mensajes con campos enviados (keys)
router.patch("/mensajes/:id", (req, res) => {
  var url = req.url;
  var id = url.split("/")[2];
  var keys = Object.keys(req.body);
  var mensaje = {};
  for (var i = 0; i < keys.length; i++) {
    mensaje[keys[i]] = req.body[keys[i]];
  }

  Mensaje.updateOne({_id: id}, mensaje, (err, doc) => {
      if(err || doc.n==0) {
        res.status(500).json({
          "msn": "Error no se pudo actualizar los datos"
        });
        return;
      }
      //aqui se deberia hacer el control mencionado lineas arriba :(
      res.status(200).json(doc);
      return;

  });
});
//actualizar  usuarios con campos enviados (keys)
router.patch("/usuarios/:id", (req, res) => {
  var url = req.url;
  var id = url.split("/")[2];
  var keys = Object.keys(req.body);
  var usuario = {};
  for (var i = 0; i < keys.length; i++) {
    usuario[keys[i]] = req.body[keys[i]];
  }
  Usuario.updateOne({_id: id}, usuario, (err, doc) => {
      if(err || doc.n==0) {
        res.status(500).json({
          "msn": "Error no se pudo actualizar los datos"
        });
        return;
      }
      //de igual manera el otro control va aca
      res.status(200).json(doc);
      return;
  });
});










//crear recipe
router.post("/recipes", (req, res) => {
  //Ejemplo de validacion
  if (req.body.name == "" && req.body.descripcion == "") {
    res.status(400).json({
      "msn" : "formato incorrecto"
    });
    return;
  }
  //console.log(req.body.ingredients);return;
  var recipe = {
    name : req.body.name, 
    descripcion : req.body.descripcion,
    ingredients : req.body.ingredients//array
  };
  //5af9bf6f b25a66 19c8 03e7db
  var recipeData = new Recipe(recipe);

  recipeData.save().then( () => {
    //content-type
    res.status(200).json({
      "msn" : "recipe Registrado con exito "
    });
  });
});

//crear ingredients
router.post("/ingredients", (req, res) => {
  //Ejemplo de validacion
  if (req.body.name == "" && req.body.kcal == "" && req.body.peso == "") {
    res.status(400).json({
      "msn" : "formato incorrecto"
    });
    return;
  }
  //console.log(req.body.ingredients);return;
  var ingredient = {
    name : req.body.name, 
    kcal : req.body.kcal,
    peso : req.body.peso
  };
  
  var ingredientData = new Ingredient(ingredient);

  ingredientData.save().then( () => {
    //content-type
    res.status(200).json({
      "msn" : "Ingrediente Registrado con exito "
    });
  });
});
//leer todos recipes
router.get("/recipes", (req, res, next) => {
  Recipe.find({}).exec( (error, docs) => {
    //console.log(docs)
    res.status(200).json(docs);
  })
});
//leer ingredients
router.get("/ingredients", (req, res, next) => {
  Ingredient.find({}).exec( (error, docs) => {
    //console.log(docs[0]._id)
    res.status(200).json(docs);
  })
});


// Leer solo un ingredient
router.get("/ingredients/:id", (req, res) => {
  var url = req.url;
  var id = url.split("/")[2];
  Ingredient.findOne({_id : id}).exec( (error, docs) => {
    if (docs != null) {
        res.status(200).json(docs);
        return;
    }

    res.status(200).json({
      "msn" : "No existe el ingrediente"
    });
  })
});
//leer solo una receta
router.get("/recipes/:id", (req, res) => {
  var url = req.url;
  var id = url.split("/")[2];
  console.log(url.split("/"))
  Recipe.findOne({_id : id}).exec( (error, docs) => {
    if (docs != null) {
        res.status(200).json(docs);
        return;
    }

    res.status(200).json({
      "msn" : "No existe la Receta"
    });
  })
});
//eliminar  receta
router.delete("/recipes/:id", (req, res) => {
  var url = req.url;
  var id = url.split("/")[2];
  Recipe.find({_id : id}).remove().exec( (err, docs) => {
      res.status(200).json(docs);
  });
});
//eliminar  ingrediente
router.delete("/ingredients/:id", (req, res) => {
  var url = req.url;
  var id = url.split("/")[2];
  Ingredient.find({_id : id}).remove().exec( (err, docs) => {
      res.status(200).json(docs);
  });
});

//actualizar campos que se envian de la receta (keys)
router.patch("/recipes/:id", (req, res) => {
  var url = req.url;
  var id = url.split("/")[2];
  var keys = Object.keys(req.body);
  var recipe = {};
  for (var i = 0; i < keys.length; i++) {
    recipe[keys[i]] = req.body[keys[i]];
  }
  //console.log(recipe);
  Recipe.findOneAndUpdate({_id: id}, recipe, (err, params) => {
      if(err) {
        res.status(500).json({
          "msn": "Error no se pudo actualizar los datos"
        });
        return;
      }
      res.status(200).json(params);
      return;
  });
});
//actualizar campos que se envian del ingrediente (keys)
router.patch("/ingredients/:id", (req, res) => {
  var url = req.url;
  var id = url.split("/")[2];
  var keys = Object.keys(req.body);
  var ingredient = {};
  for (var i = 0; i < keys.length; i++) {
    ingredient[keys[i]] = req.body[keys[i]];
  }
  //console.log(ingredient);
  Ingredient.findOneAndUpdate({_id: id}, ingredient, (err, params) => {
      if(err) {
        res.status(500).json({
          "msn": "Error no se pudo actualizar los datos"
        });
        return;
      }
      res.status(200).json(params);
      return;
  });
});
//actualizar todos los campos de una receta
router.put("/recipes/:id", (req, res) => {
  var url = req.url;
  var id = url.split("/")[2];
  var keys  = Object.keys(req.body);
  var oficialkeys = ['name', 'descripcion', 'ingredients'];
  var result = _.difference(oficialkeys, keys);
  if (result.length > 0) {
    res.status(400).json({
      "msn" : "Existe un error en el formato de envio puede hacer uso del metodo patch si desea editar solo un fragmentode la informacion"
    });
    return;
  }

  var recipe = {
    name : req.body.name,
    descripcion : req.body.descripcion,
    ingredients : req.body.ingredients
  };
  Recipe.findOneAndUpdate({_id: id}, recipe, (err, params) => {
      if(err) {
        res.status(500).json({
          "msn": "Error no se pudo actualizar los datos"
        });
        return;
      }
      res.status(200).json(params);
      return;
  });
});

//actualizar todos los campos de un ingrediente
router.put("/ingredients/:id", (req, res) => {
  var url = req.url;
  var id = url.split("/")[2];
  var keys  = Object.keys(req.body);
  var oficialkeys = ['name', 'kcal', 'peso'];
  var result = _.difference(oficialkeys, keys);
  if (result.length > 0) {
    res.status(400).json({
      "msn" : "Existe un error en el formato de envio puede hacer uso del metodo patch si desea editar solo un fragmentode la informacion"
    });
    return;
  }

  var ingredient = {
    name : req.body.name, 
    kcal : req.body.kcal,
    peso : req.body.peso
  };
  Ingredient.findOneAndUpdate({_id: id}, ingredient, (err, params) => {
      if(err) {
        res.status(500).json({
          "msn": "Error no se pudo actualizar los datos"
        });
        return;
      }
      res.status(200).json(params);
      return;
  });
});






module.exports = router;
