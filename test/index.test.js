const app = require('../src/index');
const peticion = require('supertest');

describe('GET / - basicamente me fijo si recibo rta ok de app:3000', () => {
    test('eso no se que deberia darme', async () => {
        const response = await peticion(app).get('/').send()
        expect(response.status).toBe(200);
    })
})

let usuarioUno = { nick: 'usuario1', password: '123' };
let usuarioDos = { nick: 'usuario2', password: '123' };
let usuarioTres = { nick: 'juan', password: '123' };
let usuarioCuatro = { nick: 'ceci', password: '321' };


describe('POST /login - Intentos de iniciar sesion', () => {
    test('Usuario1 => No existe, deberia ser 404', async () => {
        let respuesta = await peticion(app).post('/login').send(usuarioUno);
        expect(respuesta.status).toBe(404);
    })
    test('Usuario2 => No existe, deberia ser 404', async () => {
        let respuesta = await peticion(app).post('/login').send(usuarioDos);
        expect(respuesta.status).toBe(404);
    })
    test('Usuario3 => Tendria que ser 201 porque user y pass estan en base', async () => {
        let respuesta = await peticion(app).post('/login').send(usuarioTres);
        expect(respuesta.status).toBe(201);
    })
    test('Usuario4 => Deberia ser 401 porque existe el usuario pero no la contra', async () => {
        let respuesta = await peticion(app).post('/login').send(usuarioCuatro);
        expect(respuesta.status).toBe(401);
    })
})