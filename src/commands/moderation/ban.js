const { colors, emojis, links } = require("../../../index");

module.exports.command = {
    name: "ban",
    module: "moderation",
    description_enUS: "Bans the user with a reason (if specified).",
    usage_enUS: "<@mention | user ID> <reason (optional)>",
    aliases: ['yeet','permaban'],
    userPerms: "ban",
    botPerms: "ban",
    code: `
$setUserVar[strikes;**Ban** by <@!$authorID> • $replaceText[$replaceText[$checkCondition[$messageSlice[1]==];true;No reason specified];false;$replaceText[$messageSlice[1];|;]] • <t:$round[$formatDate[$dateStamp;X]]:R>|$getUserVar[strikes;$get[id]];$get[id]]

$ban[$get[id];$replaceText[$replaceText[$checkCondition[$messageSlice[1]==];true;No reason specified];false;$replaceText[$messageSlice[1];|;]];0]

$sendDM[$get[id];
{title:${emojis.information} You've got mail!}
{description:
This message was delivered by a moderator of $serverName.
$username[$clientID] is not affiliated with this message, by this moderator and this server.
Learn more about CRBT messages **[here](${links.info.messages})**.
}

{field:Subject:
Banned from **$serverName** ($guildID)
:no}

{field:Reason from $userTag:
$replaceText[$replaceText[$checkCondition[$messageSlice[1]==];true;Unspecified];false;$replaceText[$messageSlice[1];|;]]
:no}

{footer:You can't reply back to a CRBT message}

{color:${colors.red}}
]

$channelSendMessage[$replaceText[$replaceText[$channelExists[$getServerVar[modlogs_channel]];false;$channelID];true;$getServerVar[modlogs_channel]];

{author:$userTag[$get[id]] - Ban:$userAvatar[$get[id]]}
{field:User:
<@!$get[id]>
:yes}

{field:Moderator:
<@!$authorID>
:yes}

{field:Strike count:
$getTextSplitLength $replaceText[$replaceText[$checkCondition[$getTextSplitLength==1];true;strike];false;strikes]
$textSplit[$getUserVar[strikes;$get[id]];|]
:yes}

{field:Reason:
$replaceText[$replaceText[$checkCondition[$messageSlice[1]==];true;Unspecified];false;$replaceText[$messageSlice[1];|;]]
:no}

{color:${colors.red}}
]

$reply[$messageID;
{title:${emojis.success} Successfully banned $userTag[$get[id]].} 
{color:${colors.success}}
;no]

$onlyIf[$rolePosition[$highestRole[$get[id]]]>$rolePosition[$highestRole[$clientID]];{execute:modHierarchy}]
$if[$checkContains[$checkCondition[$authorID!=$ownerID]$checkCondition[$memberExists[$message[1]]==false];false]!=true]
$onlyIf[$rolePosition[$highestRole[$get[id]]]!=$rolePosition[$highestRole[$authorID]];{execute:modHierarchy}]
$onlyIf[$rolePosition[$highestRole[$get[id]]]>=$rolePosition[$highestRole[$authorID]];{execute:modHierarchy}]
$endif
$onlyIf[$get[id]!=$ownerID;{execute:modCantStrike}]
$onlyIf[$get[id]!=$authorID;{execute:modCantStrike}]
$onlyIf[$isBanned[$get[id]]==false;{execute:modAlready}]
$onlyBotPerms[ban;{execute:botPerms}]
$onlyPerms[ban;{execute:userPerms}]
$onlyIf[$userExists[$get[id]]==true;{execute:args}]

$let[id;$replaceText[$replaceText[$replaceText[$message[1];<@!;];<@;];>;]]

$argsCheck[>1;{execute:args}]
$onlyIf[$getGlobalUserVar[blocklisted]==false;{execute:blocklist}]
$onlyIf[$getServerVar[module_$commandInfo[$commandName;module]]==true;{execute:module}]
$if[$channelType!=dm] $onlyIf[$hasPermsInChannel[$channelID;$clientID;embedlinks]==true;{execute:embeds}] $endif
$setGlobalUserVar[lastCmd;$commandName]
$onlyIf[$channelType!=dm;{execute:guildOnly}]
    `}