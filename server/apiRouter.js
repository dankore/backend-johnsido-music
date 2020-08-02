const express = require('express');
const apiRouter = express.Router();
const userController = require('./controllers/userController');

apiRouter.get('/', userController.homepage);
apiRouter.post('/upload-audio', userController.apiUploadAudio);
apiRouter.get('/:trackID', userController.apiGetAllAudio);

module.exports = apiRouter;
