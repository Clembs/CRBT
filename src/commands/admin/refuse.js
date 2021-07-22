const { colors, emojis, links } = require("../../../index");

module.exports.command = {
    name: "refuse",
    aliases: ["cancelreport"],
    module: "admin",
    code: `
$deleteCommand

$wait[500ms]

$addCmdReactions[${emojis.success}]
  
$sendDM[$splitText[2];
{title:${emojis.information} You've got mail!}
{description:This message was delivered by a verified CRBT developer.
Learn more about CRBT messages **[here](${links.info.messages})**.
}
{field:Subject:
Your $replaceText[$replaceText[$get[title];Bug report;reported bug];Suggestion;suggestion] "[$cropText[$replaceText[$replaceText[$get[reportmessage];\`;];
;];50]$replaceText[$replaceText[$checkCondition[$charCount[$get[reportmessage]]>50];true;...];false;]](https://discord.com/channels/738747595438030888/$get[channel]/$message[1])" was refused.
:no}
{field:Message from $userTag:
$messageSlice[1]
:no}
{footer:You can't reply back to a CRBT message.}
{color:${colors.error}}
]

$textSplit[$get[footer]; | ]

$editMessage[$message[1];
{title:$get[title]}
{description:$get[description]}
{field:Status:
${emojis.error} Won't be added
:no}
{field:Message from $userTag:
$messageSlice[1]
:no}
{footer:$get[footer]}
{color:${colors.error}}
;$get[channel]]

$let[reportmessage;$replaceText[$splitText[2];\`;]]

$textSplit[$get[description];\`\`\`]

$let[title;$getEmbed[$get[channel];$message[1];title]]
$let[description;$getEmbed[$get[channel];$message[1];description]]
$let[footer;$getEmbed[$get[channel];$message[1];footer]]

$let[channel;$replaceText[$replaceText[$checkCondition[$clientID==595731552709771264];true;${links.channels.report}];false;${links.channels.reportDev}]]

$argsCheck[>1;{execute:args}]

$setGlobalUserVar[lastCmd;$commandName]
$onlyForIDs[327690719085068289;$botOwnerID;{execute:owneronly}]
    `}