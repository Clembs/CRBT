const { emojis, colors, illustrations } = require("../../../index");

module.exports.command = {
    name: "prefix",
    aliases: ["set-prefix", "set_prefix", "setprefix"],
    description_enUS: "Usage 1 (no arguments): Get CRBT's prefixes\nUsage 2: Changes the CRBT prefix for the server.",
    usage_enUS: "<new prefix (optional)>",
    userPerms: "manageserver",
    module: "settings",
    code: `
$if[$message!=]

    $setServerVar[prefix;$message]

    $reply[$messageID;
    {title:$get[title-$getGlobalUserVar[language]]}
    {description:$get[description-$getGlobalUserVar[language]]}
    {color:${colors.success}}
    ;no]

    $let[title-enUS;${emojis.general.success} Changed prefix on $serverName]
    $let[description-enUS;$username[$clientID] will now use \`$message\` as its prefix on this server.]

    $onlyIf[$charCount[$message]<=15;{execute:prefixTooLong}]
    $onlyPerms[manageserver;{execute:admins}]
    
$else

    $reply[$messageID;
    {author:$get[title-$getGlobalUserVar[language]]:${illustrations.settings}}
    $if[$hasPerms[$authorID;manageserver]==false]
    {description:$get[description-$getGlobalUserVar[language]]}
    $else
    {description:$get[descriptionAdmin-$getGlobalUserVar[language]]}
    $endif
    {color:$getGlobalUserVar[color]}
    ;no]

    $let[title-enUS;Prefix - CRBT Settings]
    $let[description-enUS;$username[$clientID] uses the \`$getServerVar[prefix]\` prefix on this server.]
    $let[descriptionAdmin-enUS;$username[$clientID] uses the \`$getServerVar[prefix]\` prefix on this server.\nIf you don't like this one, you can change it using \`$getServerVar[prefix]prefix <new prefix>\`.]

$endif

$onlyIf[$getGlobalUserVar[blocklisted]==false;{execute:blocklist}]
$onlyIf[$getServerVar[module_$commandInfo[$commandName;module]]==true;{execute:module}]
$if[$channelType!=dm] $onlyIf[$hasPermsInChannel[$channelID;$clientID;embedlinks]==true;{execute:embeds}] $endif
$setGlobalUserVar[lastCmd;$commandName]
$onlyIf[$channelType!=dm;{execute:guildOnly}]
    `}