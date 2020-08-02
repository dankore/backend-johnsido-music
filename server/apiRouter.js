const express = require('express');
const apiRouter = express.Router();
const userController = require('./controllers/userController');
const audioController = require('./controllers/audioController');

apiRouter.get('/', userController.homepage);
apiRouter.post('/upload-audio', audioController.apiUploadAudio);
apiRouter.get('/:trackID', audioController.apiGetAllAudio);

module.exports = apiRouter;
