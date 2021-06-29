const { colors, emojis, links } = require("../../../index");

module.exports.command = {
  name: "reply",
  aliases: ["replyreport"],
  code: `
$deleteCommand

$wait[500ms]

$addCmdReactions[${emojis.general.success}]
  
$sendDM[$splitText[2];
{title:${emojis.general.information} You've got mail!}
{description:This message was delivered by a verified CRBT developer.
Learn more about official CRBT messages [here](${links.info.messages}).}
{field:Subject:
Reported $toLowercase[$get[title]] "[$cropText[$replaceText[$replaceText[$get[reportmessage];\`;];
;];50]...](https://discord.com/channels/738747595438030888/$get[channel]/$message[1])"
:no}
{field:Message from Clembs#2925:
$messageSlice[1]
:no}
{footer:You can't reply back to a CRBT message.}
{color:${colors.blue}}
]

$textSplit[$get[footer]; | ]

$editMessage[$message[1];
{title:$get[title]}
{description:$get[description]}
{field:Status:
Pending
:no}
$if[$messageSlice[1]!=]
{field:Message from $userTag:
$messageSlice[1]
:no}
$endif
{footer:$get[footer]}
{color:${colors.orange}}
;$get[channel]]

$let[reportmessage;$replaceText[$splitText[2];\`;]]

$textSplit[$get[description];\`\`\`]

$let[title;$getEmbed[$get[channel];$message[1];title]]
$let[description;$getEmbed[$get[channel];$message[1];description]]
$let[footer;$getEmbed[$get[channel];$message[1];footer]]

$let[channel;$replaceText[$replaceText[$checkCondition[$clientID==595731552709771264];true;${links.channels.report}];false;${links.channels.reportDev}]]

$argsCheck[>1;{execute:args}]

$setGlobalUserVar[lastCmd;$commandName]
$onlyForIDs[327690719085068289;407261542325813250;$botOwnerID;{execute:owneronly}]
  `}