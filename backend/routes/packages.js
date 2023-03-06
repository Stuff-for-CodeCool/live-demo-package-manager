const router = require("express").Router();
const path = require("path");
const { reader, writer } = require("../fileReader");

const filePath = path.join(`${__dirname}/../pkgs.json`);

router.use("/", async (req, res, next) => {
    req.packages = await reader(filePath);
    next();
});

router.get("/", (req, res) => res.send(req.packages));

module.exports = router;
