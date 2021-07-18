const {emojis, colors} = require("../../../index");

module.exports.command = {
    name: "yt",
    module: "music",
    aliases: ["youtube", "yttogether", "w2g"],
    description_enUS: "Allows you to create a YouTube Together activity within a voice channel (experimental Discord feature).",
    botPerms: "createinvite",
    code: `
$apiMessage[;
{title:$get[title-$getGlobalUserVar[language]]}
{description:$get[description-$getGlobalUserVar[language]]}
{color:${colors.success}}
;{actionRow:Join Activity,2,5,$replaceText[$getObjectProperty[invite];:;#COLON#]}:$messageID:no:yes]

$let[title-enUS;${emojis.success} Here you go!]
$let[description-enUS;Click on the button below to join the YouTube Together activity right on Discord.]

$djsEval[
const { DiscordTogether } = require('discord-together');
client.discordTogether = new DiscordTogether(client);
client.discordTogether.createTogetherCode('$voiceID', 'youtube').then(async invite => {
d.object.invite = invite.code;
});]

$onlyIf[$hasPermsInChannel[$voiceID;$clientID;createinvite]==true;{execute:botPerms}]
$onlyIf[$voiceID!=;{execute:novoice}]
$argsCheck[0;{execute:args}]
$onlyIf[$getGlobalUserVar[blocklisted]==false;{execute:blocklist}]
$onlyIf[$getServerVar[module_$commandInfo[$commandName;module]]==true;{execute:module}]
$if[$channelType!=dm] $onlyIf[$hasPermsInChannel[$channelID;$clientID;embedlinks]==true;{execute:embeds}] $endif
$setGlobalUserVar[lastCmd;$commandName]
`}