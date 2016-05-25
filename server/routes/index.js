'use strict'

const path = require('path')
const apiHandlers = require('./api')
const healtCheck = require('./health')
const express = require('express')
const multer = require('multer')

const upload = multer()

const router = new express.Router()
const apiRouter = new express.Router()

router.get('/isalive', healtCheck)

router.use('/devices', express.static(path.join(__dirname, '../../config/devices')))
router.use(express.static(path.join(__dirname, '../../public')))

apiRouter.get('/firmware/:id', apiHandlers.getFirmwareById)
apiRouter.get('/rules/', apiHandlers.getRules)
apiRouter.get('/rules/:id', apiHandlers.getRuleById)
apiRouter.post('/rules/', apiHandlers.createRule)
apiRouter.delete('/rules/:id', apiHandlers.removeRule)
apiRouter.put('/rules/:id', apiHandlers.updateRule)
apiRouter.put('/device-config', apiHandlers.updateDeviceConfig)
apiRouter.get('/device-config/original', apiHandlers.getOriginalDeviceConfig)
apiRouter.get('/images/:id', apiHandlers.getImageById)
apiRouter.post('/images', upload.single('file'), apiHandlers.uploadImage)

router.use('/api', apiRouter)

module.exports = router
