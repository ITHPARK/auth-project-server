const express = require('express');
const usersController = require('../controller/users.controller');
const usersRouter = express.Router();
const authMiddleware = require('../middleware/authmiddleware'); 


//라우터 처리 user경로에 있는 요처안 처리하게 된다.
/*
    !!CRUD

    post : create
    get : read
    put : update
    delete : delete
*/

usersRouter.post('/', usersController.createUser);
usersRouter.post('/login', usersController.loginCheck);
usersRouter.post('/token', usersController.tokenRefresh);

//authmiddleware을 넣어 토큰인증 절차응 거치며, 해당경로는 보호되는 경로이다.
usersRouter.get('/:userId', authMiddleware, usersController.getUserById); 
usersRouter.delete('/:userId', authMiddleware, usersController.deleteUser); 


module.exports = usersRouter;