const { emojis, tokens } = require("../../../index");

module.exports.command = {
    name: "sperm",
    aliases: ["cum", "coom", "ejaculation", "sperm"],
    description_enUS: "Gives a random image of a fictional character ejaculating.",
    module: "nsfw",
    code: `
$reactionCollector[$botLastMessageID;$authorID;10m;${emojis.music.loop};shufflensfw;yes]

$reply[$messageID;
{image:$randomText[$jsonRequest[https://nekos.life/api/v2/img/cum;url];$jsonRequest[https://nekos.life/api/v2/img/cum_jpg;url]}
{color:$getGlobalUserVar[color]}
;no]

$argsCheck[0;{execute:args}]
$onlyIf[$getGlobalUserVar[blocklisted]==false;{execute:blocklist}]
$onlyNSFW[{execute:nsfw}]
$onlyIf[$getServerVar[module_$commandInfo[$commandName;module]]==true;{execute:module}]
$onlyIf[$hasPermsInChannel[$channelID;$clientID;embedlinks]==true;{execute:embeds}]
$setGlobalUserVar[lastCmd;$commandName]
    `}