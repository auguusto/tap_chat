///server socket
const { Mongoose } = require('mongoose');
const Chat = require('./models/Chat');

module.exports = function (io) {
  var users = {};//aca toque
  var default_room = '1';
  var messages = '';
  var socketIdUnico = '';
  

  io.on('connection', async socket => {
    socket.join(default_room);
    let messages = await Chat.find({ room: default_room });

    socket.on('new room', function (data) {      
      socket.join(data.room);
      socket.broadcast.to(data.room).emit('new message', {
        nick: 'Admin',
        msg: 'El usuario ' + socket.nickname + ' ingreso a la sala!'
      });
      let socketIdUnico = socket.id;
      console.log(messages);
      io.to(socketIdUnico).emit('load old msgs', messages);
    });

    //delete chats
    socket.on('delete chat', function (data) {
      Chat.deleteMany({ nick: data.nick, room: data.room }, function (err) {
        if (err) console.log(err);
        console.log("Se borro de Mongo OK");
      });
      socket.to(data.room).emit('borrarVentanaChat', 'borrar ventana');
    });

    
    socket.on('cargarMsjsViejos', async (data, cb) => {
      let messages = await Chat.find({ room: data.room });
      console.log(messages);
      io.in(data.room).emit('load old msgs', messages);
    });

    //Salir de la sala.  Itera entre todas las del set socket.rooms
    socket.on('salirDeSala', async (data, cb) => {    
      socket.rooms.forEach((value) => {
        if(value === '1' || value === '2' || value === '3'){
          let salaAnt = value;
          //console.log('esta seria la sala anterior ', salaAnt);
          socket.leave(salaAnt);
        };
     });
      console.log('salio de sala ok');      
    })


    // nuevo usuario funciona OK
    socket.on('new user', (data, cb) => {
      let socketIdUnico = socket.id;
      if (data.nick in users) /*ESTO ES PARA LA CAJA CON LOS NOMBRES DE USUARIO*/ {
        cb(false);
      } else {
        cb(true);
        socket.nickname = data.nick;
        users[socket.nickname] = socket;
        updateNicknames();
      }
      socket.to(socketIdUnico).emit('load old msgs', messages);
    });

    //server recibe el mensaje lo re-transmite con emit
    socket.on('send message', async (data, cb) => {
      var nuevoMensaje = new Chat({
        msg: data.msg,
        nick: socket.nickname,
        read_flag: 'Y',
        delete_flag: 'N',
        room: data.room
      });
      await nuevoMensaje.save();
      io.in(data.room).emit('new message', { msg: data.msg, nick: socket.nickname });
    });


    socket.on('cambioDeSala', async (data, cb) => {
      let socketIdUnico = socket.id;
      io.to(socketIdUnico).emit('borrarVentanaChat', 'borrar ventana');   
      socket.join(data.room);
      let messages = await Chat.find({room: data.room});
      socket.to(data.room).emit('new message', {
        nick: 'Admin',
        msg: 'El usuario ' + socket.nickname + ' ingreso a la sala!'
      });
      io.to(socketIdUnico).emit('load old msgs', messages);
    });

    socket.on('disconnect', data => {
      if (!socket.nickname) return;
      delete users[socket.nickname];
      updateNicknames();
      socket.broadcast.to(data.room).emit('new message', {
        msg: "El usuario " + data.nick + " se desconectó =( ",
        nick: "Admin"
      });
    });

    function updateNicknames() {
      io.sockets.emit('usernames', Object.keys(users));
    }

    function getMensajesDeUnaSala(sala) {
      Chat.find({ room: sala }, function (err, data) {
        if (err) console.log(err);
        console.log("getmensajesdeunasala");
      });
    }
  });
}
