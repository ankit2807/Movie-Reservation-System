const router = require('express').Router();
const { addShowTime, getShowTimeById, getShowTimes, updateShowTimeById, deleteShowTime } = require("../controller/showTimeController");
const { verifyTokenAndAdmin } = require('../utils/tokenVerification')

//create
router.post("/", verifyTokenAndAdmin, addShowTime);

//update
router.put("/:id", verifyTokenAndAdmin, updateShowTimeById);

//delete
router.delete("/:id", verifyTokenAndAdmin, deleteShowTime);

//get showtime by id
router.get("/find/:id", getShowTimeById);

//get all showtimes
router.get("/", getShowTimes);

module.exports = router;