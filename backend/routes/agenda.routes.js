const express = require('express');
const router = express.Router();
const agendaController = require('../controllers/agenda.controller');
const auth = require("../middleware/auth");

router.post('/', auth, agendaController.session);
router.get('/', auth, agendaController.getAgenda);
// router.post('/', agendaController.getById); // para dashboard
router.get('/:idCliente', auth, agendaController.getById); // para flutter
router.put('/:id', auth, agendaController.updateSession);
router.post('/finalizar-sessao', agendaController.finalizarSessaoManual);

module.exports = router;