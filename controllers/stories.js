const Story = require("../models/story");
// const slugify = require("slugify");

exports.create = async (req, res) => {
  try {
    // console.log(req.body);
    res.json(
      await new Story({
        image: req.body.story,
      }).save()
    );
  } catch (err) {
    console.log("Story CREATE ERR ----->", err);
    res.status(400).send("Story create failed");
  }
};

exports.list = async (req, res) =>
  res.json(await Story.find({}).sort({ createdAt: -1 }).exec());

exports.remove = async (req, res) => {
  try {
    const deleted = await Story.findOneAndDelete({
      "image.public_id": req.params.public_id,
    });
    if (!deleted) {
      return res.status(404).send("Story not found");
    }
    res.json(deleted);
  } catch (err) {
    res.status(400).send("Story removal failed");
  }
};
