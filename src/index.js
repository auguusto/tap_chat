
const http = require('http');
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const app = express ();
//nuevo para login(+)
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const User = require('./models/User');
//nuevo para login(-)

const SocketIO = require('socket.io')

app.set('port', process.env.PORT||3000);

//enviando archivos estaticos
app.use(express.static(path.join( __dirname,'public')));  //v1



//nuevo para login(+)
//app.use(bodyParser.urlencoded({extended: false}));  //no funciona
app.use(bodyParser.json());
// all requests   genera un log por  cada request recibido
app.use((req, res, next) => {
    console.log(`${req.method}: ${req.path}`);
     next();
  });

  //publica endpoint /login con methodo POST
  app.post('/login', async (req, res) => {
      //console.log('en /login. body recibido: ', req.body);
      //console.log('en /login. nick recibido: ', req.body.nick);

      //(+)para crear un usuario de prueba -- comentar si no es necesario
      /*
      let hashPassword = await bcrypt.hash('123', 10);
      let newUser = new User({
          nick: 'juan',
          password: hashPassword
      });
      await newUser.save();*/      

      try{
           User.findOne({ nick: req.body.nick}).then(foundUser => {
               if (foundUser) {
                   //console.log('usuario encontrado');
                   //console.log(foundUser);

                   let submittedPass = req.body.password;
                   let storedPass = foundUser.password;

                   const passwordMatch =  bcrypt.compareSync(submittedPass, storedPass);
                   if (passwordMatch) {
                        //console.log('passwordMatch');
                        res.status(201).end();  //login created ok
                   } else {
                         //console.log('No passwordMatch');
                       res.status(401).end();    //unauthorized
                   }

               } else {
                 //console.log('no encontrado ');
                  res.status(404).end();   // not found
               }
           });

         } catch{
              //console.log('OTRO ERROR');
              res.status(400).end();  //bad request
         };

  });
//nuevo para login(-)

//levantando el servidor
//const server = app.listen(app.get('port'), () =>{            //Login
const httpserver = http.createServer(app);                     //login
const server   =  httpserver.listen(app.get('port'), () =>{    //login
  console.log('server on port: ', app.get('port'));
});


//conexion db
mongoose.connect('mongodb://localhost/chat-database')
.then(db=>console.log('bd conetada'))
.catch(err=>console.log('err'));

const io = SocketIO(server);

require('./sockets')(io);

module.exports = app;