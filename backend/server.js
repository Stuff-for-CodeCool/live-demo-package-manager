const express = require("express");
const cors = require("cors");
const path = require("path");

const { reader } = require("./fileReader");
const filePath = path.join(`${__dirname}/pkgs.json`);

const packagesRoutes = require("./routes/packages");
const editingPackages = require("./routes/editingPackages");

const port = 9001;

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());
app.use(express.static(path.join(__dirname + "/views/public/")));

app.set("view engine", "ejs");

app.use("/", async (req, res, next) => {
    const packs = await reader(filePath);
    req.packs = packs.packages;
    next();
});

app.get("/", (req, res) => {
    res.render("index.ejs", { packages: req.packs });
});

app.use("/api/packages", packagesRoutes);

app.use("/edit/package", editingPackages);

app.listen(port, () => console.log(`http://127.0.0.1:${port}`));
