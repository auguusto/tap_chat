//cliente
$(function () {
  //alert('hola')
  const socket = io();
  //get dom desde interface
  const $messageForm = $('#message-form');
  const $messageBox = $('#message');
  const $chat = $('#chat');
  //get dom desde ninckname
  const $nickForm = $('#nickForm');
  const $nickError = $('#nickError');
  const $nickName = $('#nickName');
  const $nickPassword = $('#nickPassword'); //login
  const $users = $('#usernames');
  const $room = $('#room');
  const $deleteBt = $('#deleteBt');
  var xhr = new XMLHttpRequest();

  //eventos
  $deleteBt.click(function () {
    selected_room = $("input[name='room_option']:checked").val();
    user = $nickName.val();
    borrarVentanaChat();
    socket.emit('delete chat', { room: selected_room, nick: user });
    socket.emit('cargarMsjsViejos', { room: selected_room });
  });

  $room.change(function () {
    selected_room = $("input[name='room_option']:checked").val();// trae la sala elegida
    user = $nickName.val(); 
    socket.emit('salirDeSala', 'quiero salir');   //no pasa una en particular porque el servidor revisa directamente
    socket.emit('cambioDeSala', { room: selected_room, nick: user });
    
  });

  $nickForm.submit(e => {
    e.preventDefault();

    //login-inicio   envio http request al server usando XMLHttpRequest()
    var xhr = new XMLHttpRequest();
    var data = { nick: $nickName.val(), password: $nickPassword.val() };
    xhr.open('POST', '/login', false);   //sincronico
    xhr.setRequestHeader('Content-Type', 'application/json');
    try {
      xhr.send(JSON.stringify(data));  //envia request
      //escucha respuesta:
      //alert('sinc alert ', xhr.status);
      if (xhr.status != 201) {
        //alert(`Login No ok:  ${xhr.status}: ${xhr.statusText}`);
        $nickError.html(`
          <div class="alert alert-danger">
          Login Invalido
          </div>
          `);
      } else {
        //alert('Login ok', xhr.response);

        // habilitar el chat
        selected_room = $("input[name='room_option']:checked").val();
        user = $nickName.val();
        alert('entrando con usuario:', user);
        socket.emit('new user', { room: selected_room, nick: user }, data => {
          if (data) {
            $('#nickWrap').hide();
            $('#contentWrap').show();
          } else {
            $nickError.html(`
              <div class="alert alert-danger">
              ese usuario ya existe
              </div>
              `);
          }
        });
        socket.emit('new room', { room: selected_room, nick: user });

      }
    } catch (err) {
      $nickError.html(`
        <div class="alert alert-danger">
         No se pudo validar el login.
        </div>
        `);
    }
    //login-fin

  });

  $messageForm.submit(e => {
    e.preventDefault();
    selected_room = $("input[name='room_option']:checked").val();
    socket.emit('send message', { msg: $messageBox.val(), room: selected_room });
    $messageBox.val('');
  });

  socket.on('new message', function (data) {
    displayMsg(data);
  });

  socket.on('usernames', data => {
    let html = '';
    for (let i = 0; i < data.length; i++) {
      if (data[i] == $nickName.val()) {
        html += ` <p><b>${data[i]}</b></p>`
      } else {
        html += ` <p>${data[i]}</p>`
      }
    }
    $users.html(html);
  });

  socket.on('load old msgs', msgs => {
    console.log('entro en el load old');
    console.log('son ' + msgs.length + ' mensajes...');
    for (let i = 0; i < msgs.length; i++) {
      displayMsg(msgs[i]);
    }
  });

  socket.on('borrarVentanaChat', msg => {
    console.log('borrarVentanaChat');
    borrarVentanaChat();
  })


  function displayMsg(data) {
    $chat.append('<b>' + data.nick + '</b>: ' + data.msg + '<br/>');
  }

  function borrarVentanaChat() {
    var cajaDeChat = document.getElementById('chat');
    cajaDeChat.innerHTML = "";
  }
})
