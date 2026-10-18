const express = require("express");
const router = express.Router();
const Counter = require("../models/Counter");

router.get("/", async (req, res) => {
  try {
    let counter = await Counter.findOne();

    if (!counter) {
      counter = await Counter.create({
        count: 0,
      });
    }

    res.json(counter);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

router.put("/increment", async (req, res) => {
  try {
    let counter = await Counter.findOne();

    if (!counter) {
      counter = await Counter.create({
        count: 0,
      });
    }

    counter.count += 1;

    await counter.save();

    res.json(counter);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

module.exports = router;