const express = require("express");
const router = express.Router();
const eventOrganiserController = require("../controllers/eventOrganisorController");

router.post('/register', eventOrganiserController.createEventOrganiser);
router.get('/', eventOrganiserController.getOrganisorCount);
router.get('/all', eventOrganiserController.getAllEventOrganisers);
router.get('/:id', eventOrganiserController.getEventOrganiserById);
router.put('/:id', eventOrganiserController.updateEventOrganiser);
router.delete('/:id', eventOrganiserController.deleteEventOrganiser);


module.exports = router;