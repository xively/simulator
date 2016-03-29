'use strict';

const path = require('path');
const viewHandlers = require('./views');
const apiHandlers = require('./api');
const healtCheck = require('./health');
const express = require('express');

const router = new express.Router();
const apiRouter = new express.Router();

router.get('/isalive', healtCheck);

router.get('/', viewHandlers.main);
router.get('/virtual-device', viewHandlers.virtualDevice);
router.get('/manage', viewHandlers.manage);
router.get('/gotoHabanero', viewHandlers.gotoHabanero);
router.use(express.static(path.join(__dirname, '../../public')));
router.get('/virtual-device/*', viewHandlers.virtualDevice);
router.get('/manage/*', viewHandlers.manage);

apiRouter.get('/firmware/:id', apiHandlers.getFirmwareById);
apiRouter.put('/inventory/:verb/:id', apiHandlers.updateInventory);
apiRouter.get('/rules/', apiHandlers.getRules);
apiRouter.get('/rules/:id', apiHandlers.getRuleById);
apiRouter.post('/rules/', apiHandlers.createRule);
apiRouter.delete('/rules/:id', apiHandlers.removeRule);
apiRouter.put('/rules/:id', apiHandlers.updateRule);

router.use('/api', apiRouter);

module.exports = router;
