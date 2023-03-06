const router = require("express").Router();
const path = require("path");
const { writer } = require("../fileReader");

const filePath = path.join(`${__dirname}/../pkgs.json`);

const sorter = (a, b) => new Date(b.date) - new Date(a.date);

const formatDate = () => {
    const year = new Date().getFullYear();
    let month = "0" + (new Date().getMonth() + 1);
    let day = "0" + new Date().getDate();
    return `${year}-${month.slice(-2)}-${day.slice(-2)}`;
};

router.get("/", (req, res) =>
    res.render("adder.ejs", {
        dependencies: req.packs.map((p) => ({
            id: p.id,
            name: p.name,
            version: p.releases.sort(sorter)[0].version,
        })),
    })
);

router.post("/", async (req, res) => {
    let { name, description, dependencies, releases } = req.body;

    dependencies = dependencies
        .split(/[ ,]+/gim)
        .map((d) => req.packs.find((p) => p.name === d)?.id)
        .filter((d) => !!d);

    releases = [
        {
            date: formatDate(),
            version: releases,
        },
    ];
    const toWrite = {
        id: Math.max(...req.packs.map((p) => p.id)) + 1,
        name,
        description,
        dependencies,
        releases,
    };

    await writer(filePath, { packages: [...req.packs, toWrite] });
    res.json(toWrite);
});

router.get("/:id", (req, res) => {
    const pack = req.packs.find((p) => p.id === parseInt(req.params.id));
    pack.releases = pack.releases.map((r) => r.version).join(", ");
    pack.dependencies = pack.dependencies.map((d) => ({
        id: d,
        name: req.packs.find((p) => p.id === parseInt(d, 10)).name,
        version: req.packs
            .find((p) => p.id === parseInt(d, 10))
            .releases.sort(sorter)[0].version,
    }));

    res.render("editor.ejs", { ...pack });
});

router.put("/:id", async (req, res) => {
    const toUpdate = req.body;

    toUpdate.id = parseInt(toUpdate.id, 10);

    toUpdate.dependencies = `${toUpdate.dependencies}`
        .split(/[ ,]+/gim)
        .map((d) => req.packs.find((p) => p.name === d)?.id)
        .filter((d) => !!d);

    toUpdate.releases = [
        {
            date: formatDate(),
            version: toUpdate.releases,
        },
    ];

    req.packs = [
        ...req.packs.filter((p) => p.id !== parseInt(req.params.id, 10)),
        toUpdate,
    ];

    await writer(filePath, { packages: [...req.packs, toUpdate] });
    res.json(toUpdate);
});

router.delete("/:id", async (req, res, next) => {
    req.packs = req.packs.filter((p) => p.id !== parseInt(req.params.id, 10));

    await writer(filePath, { packages: req.packs });
    res.json(req.packs);
    next();
});

module.exports = router;
