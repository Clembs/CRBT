const { meanings } = require("../../data/api.json");
const { bot } = require("../../index");
const router = require("express").Router();
const { version } = require("../../package.json");

router.get("/", async function (req, res) {
    res.json({
        status: 200,
        online: true,
        build: version,
    });
});

router.get("/meaning", async function (req, res) {
    res.json({
        status: 200,
        meaning: meanings[Math.floor(Math.random() * (meanings.length - 0 + 1))],
    });
});

router.get("/command/:name", async function(req, res, next) {
    const cmd = bot.client.bot_commands.find(
      (c) =>
            c.name.toLowerCase() === req.params.name.toLowerCase() ||
            (c.aliases && typeof c.aliases === "object"
              ? c.aliases.includes(req.params.name.toLowerCase())
              : c.aliases === req.params.name.toLowerCase())
        ) || {};
    if(!cmd.name) {
        res.status(404).json({
            status: 404,
            error: `Couldn't find the command '${req.params.name}'`,
        });
    }
    else {
        res.json({
            status: 200,
            name: cmd.name,
            aliases: cmd.aliases,
            module: cmd.module,
            cooldown: cmd.cooldown,
            description: {
                enUS: cmd.description_enUS,
                enUK: cmd.description_enUK,
                frFR: cmd.description_frFR,
                esES: cmd.description_esES,
                ru: cmd.description_ru,
                ptBR: cmd.description_ptBR,
            },
            usage: {
                enUS: cmd.usage_enUS,
                enUK: cmd.usage_enUK,
                frFR: cmd.usage_frFR,
                esES: cmd.usage_esES,
                ru: cmd.usage_ru,
                ptBR: cmd.usage_ptBR,
            },
            examples: {
                enUS: cmd.examples_enUS,
                enUK: cmd.examples_enUK,
                frFR: cmd.examples_frFR,
                esES: cmd.examples_esES,
                ru: cmd.example_ru,
                ptBR: cmd.examples_ptBR,
            },
            botPerms: cmd.botPerms,
            userPerms: cmd.userPerms,
        })
    }
})

module.exports = router;