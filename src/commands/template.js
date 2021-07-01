module.exports.command = {
    name: "template",
    module: "misc",
    aliases: ["templatealias"],
    description_enUS: "description.",
    usage_enUS: "<something cool>",
    botperms: [""],
    code: `
$reply[$messageID;
{title:$get[title-$getGlobalUserVar[language]]}
{description:$get[description-$getGlobalUserVar[language]]}
{color:$getGlobalUserVar[color]}
;no]

$let[title-enUS;hi]
$let[description-enUS;description]

$argsCheck[0;{execute:args}]
$onlyIf[$getGlobalUserVar[blocklisted]==false;{execute:blocklist}]
$onlyIf[$getServerVar[module_$commandInfo[$commandName;module]]==true;{execute:module}]
$if[$channelType!=dm] $onlyIf[$hasPermsInChannel[$channelID;$clientID;embedlinks]==true;{execute:embeds}] $endif
$setGlobalUserVar[lastCmd;$commandName]
    `}

// for a guildOnly cmd, add this at the end
// $onlyIf[$channelType!=dm;{execute:guildOnly}]
// you can replace the ^ for the opposite
// also change the argsCheck count ofc