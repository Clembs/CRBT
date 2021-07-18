const { colors, emojis, links } = require("../../../index");

module.exports.command = {
    name: "mute",
    module: "moderation",
    description_enUS: "Adds the muted role to the user with a reason (if specified).",
    usage_enUS: "<@mention | user ID> <reason (optional)>",
    aliases: ['ftg'],
    userPerms: ["manageroles"],
    botPerms: ["manageroles"],
    code: `
$setUserVar[strikes;**Mute** by <@!$authorID> • $replaceText[$replaceText[$checkCondition[$messageSlice[1]==];true;No reason specified];false;$replaceText[$messageSlice[1];|;]] • <t:$round[$formatDate[$dateStamp;X]]:R>|$getUserVar[strikes;$get[id]];$get[id]]

$giveRole[$get[id];$getServerVar[muted_role]]

$sendDM[$get[id];
{title:${emojis.information} You've got mail!}
{description:
This message was delivered by a moderator of $serverName.
$username[$clientID] is not affiliated with this message, by this moderator and this server.
Learn more about CRBT messages **[here](${links.info.messages})**.
}

{field:Subject:
Muted from **$serverName** ($guildID)
:no}

{field:Reason from $userTag:
$replaceText[$replaceText[$checkCondition[$messageSlice[1]==];true;Unspecified];false;$replaceText[$messageSlice[1];|;]]
:no}

{footer:You can't reply back to a CRBT message}

{color:${colors.orange}}
]

$channelSendMessage[$replaceText[$getServerVar[modlogs_channel];none;$channelID];

{author:$userTag[$get[id]] - Mute:$userAvatar[$get[id]]}

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

{color:${colors.orange}}
]

$reply[$messageID;
{title:${emojis.success} Successfully muted $userTag[$get[id]].} 
{color:${colors.success}}
;no]

$onlyIf[$rolePosition[$highestRole[$get[id]]]!=$rolePosition[$highestRole[$authorID]];{title:${emojis.error} You can't mute someone that's as high as you in the role hierachy!} {color:${colors.red}}]
$onlyIf[$rolePosition[$highestRole[$get[id]]]>=$rolePosition[$highestRole[$clientID]];{title:${emojis.error} I can't mute someone higher than me in the role hierachy!} {color:${colors.red}}]
$onlyIf[$rolePosition[$highestRole[$get[id]]]>=$rolePosition[$highestRole[$authorID]];{title:${emojis.error} You can't mute someone higher than you in the role hierachy!} {color:${colors.red}}]
$onlyIf[$get[id]!=$ownerID;{execute:cantStrike}]
$onlyIf[$get[id]!=$authorID;{execute:cantStrike}]
$onlyIf[$hasRole[$get[id];$getServerVar[muted_role]]==false;{title:${emojis.error} This user is already muted!} {color:${colors.red}}]
$onlyIf[$getServerVar[muted_role]!=none;{title:${emojis.error} No muted role to give was set!} {description:Use \`$getServerVar[prefix]mutedrole $commandInfo[mutedrole;usage]\` to change it.} {color:${colors.red}}]
$onlyBotPerms[manageroles;{execute:botPerms}]
$onlyPerms[manageroles;{execute:userPerms}]
$onlyIf[$userExists[$get[id]]==true;{execute:args}]

$let[id;$replaceText[$replaceText[$replaceText[$message[1];<@!;];<@;];>;]]

$argsCheck[>1;{execute:args}]
$onlyIf[$getGlobalUserVar[blocklisted]==false;{execute:blocklist}]
$onlyIf[$getServerVar[module_$commandInfo[$commandName;module]]==true;{execute:module}]
$if[$guildID!=]$onlyIf[$hasPermsInChannel[$channelID;$clientID;embedlinks]==true;{execute:embeds}]$endif
$setGlobalUserVar[lastCmd;$commandName]
$onlyIf[$channelType!=dm;{execute:guildOnly}]
    `}