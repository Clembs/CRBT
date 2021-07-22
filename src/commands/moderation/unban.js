const {colors,emojis,links} = require("../../../index");

module.exports.command = {
    name: "unban",
    module: "moderation",
    description_enUS: "Unbans a banned user from the server.",
    usage_enUS: "<user ID>",
    userPerms: "ban",
    botPerms: "ban",
    code: `
$unban[$get[id]]

$sendDM[$get[id];
{title:${emojis.information} You've got mail!}
{description:
This message was delivered by a moderator of $serverName.
$username[$clientID] is not affiliated with this message, by this moderator and this server.
Learn more about CRBT messages **[here](${links.info.messages})**.
}

{field:Subject:
Unbanned from **$serverName** ($guildID)
:no}

{footer:You can't reply back to a CRBT message}

{color:${colors.green}}
]

$channelSendMessage[$replaceText[$getServerVar[modlogs_channel];none;$channelID];

{author:$userTag[$get[id]] - Unban:$userAvatar[$get[id]]}
{field:User:
<@!$get[id]>
:yes}

{field:Moderator:
<@!$authorID>
:yes}

{field:Strike count:
$math[$getTextSplitLength-1] $replaceText[$replaceText[$checkCondition[$math[$getTextSplitLength-1]==1];true;strike];false;strikes]
$textSplit[$getUserVar[strikes;$get[id]];|]
:yes}

{color:${colors.green}}
]

$reply[$messageID;
{title:${emojis.success} Successfully unbanned \`$get[id]\`.} 
{color:${colors.success}}
;no]

$if[$authorID!=$ownerID]
$onlyIf[$rolePosition[$highestRole[$get[id]]]!=$rolePosition[$highestRole[$authorID]];{execute:modHierarchy}]
$onlyIf[$rolePosition[$highestRole[$get[id]]]>=$rolePosition[$highestRole[$clientID]];{execute:modHierarchy}]
$onlyIf[$rolePosition[$highestRole[$get[id]]]>=$rolePosition[$highestRole[$authorID]];{execute:modHierarchy}]
$endif
$onlyIf[$get[id]!=$ownerID;{execute:modCantStrike}]
$onlyIf[$get[id]!=$authorID;{execute:modCantStrike}]
$onlyIf[$isBanned[$get[id]]==true;{execute:modAlready}]
$onlyBotPerms[ban;{execute:botPerms}]
$onlyPerms[ban;{execute:userPerms}]
$onlyIf[$userExists[$get[id]]==true;{execute:args}]

$let[id;$message[1]]

$argsCheck[1;{execute:args}]
$onlyIf[$getGlobalUserVar[blocklisted]==false;{execute:blocklist}]
$onlyIf[$getServerVar[module_$commandInfo[$commandName;module]]==true;{execute:module}]
$if[$channelType!=dm] $onlyIf[$hasPermsInChannel[$channelID;$clientID;embedlinks]==true;{execute:embeds}] $endif
$setGlobalUserVar[lastCmd;$commandName]
$onlyIf[$channelType!=dm;{execute:guildOnly}]
    `}