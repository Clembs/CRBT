const { colors, emojis, illustrations } = require("../../../index");

module.exports.awaitedCommand = {
    name: "mute1",
    code: `
$editMessage[$message[1];
{author:$get[nowplaying-$getGlobalUserVar[language]]:${illustrations.music.information}}
{title:$songInfo[title]}
{url:$songInfo[url]}
{description:
$get[duration-$getGlobalUserVar[language]] \`$replaceText[$get[current]/$get[total];/00:00:00; (🔴 LIVE)]\`
$get[playing-$getGlobalUserVar[language]]
}

{field:$get[uploaded-$getGlobalUserVar[language]]:
**[$songInfo[publisher]]($songInfo[url])**
:yes}
{field:$get[added-$getGlobalUserVar[language]]:
<@!$songInfo[userID]>
:yes}
{field:$get[volume-$getGlobalUserVar[language]]:
$replaceText[$replaceText[$checkContains[$getServerVar[volume];-muted];false;$math[$replaceText[$getServerVar[volume];-muted;]*2]%];true;${emojis.music.mute} Muted] ($get[volumeTip-$getGlobalUserVar[language]])
:no}
{thumbnail:$songInfo[thumbnail]}
{color:$getGlobalUserVar[color]}
;$channelID]

$let[current;$replaceText[$replaceText[$splitText[3];(;];);]$textSplit[$songInfo[current_duration]; ]]
$let[total;$replaceText[$replaceText[$splitText[3];(;];);]$textSplit[$songInfo[duration]; ]]

$let[nowplaying-enUS;Currently playing]
$let[added-enUS;Added by]
$let[volume-enUS;Volume]
$let[uploaded-enUS;Uploader]
$let[duration-enUS;Duration:]
$let[playing-enUS;Playing in <#$voiceID[$clientID]> and bound to <#$getServerVar[music_channel]>.]
$let[volumeTip-enUS;\`$getServerVar[prefix]volume <new volume>\`]

$if[$checkContains[$getServerVar[volume];-muted]==true]
    $volume[$replaceText[$getServerVar[volume];-muted;]]
    $setServerVar[volume;$replaceText[$getServerVar[volume];-muted;]]
$else
    $volume[0]
    $setServerVar[volume;$getServerVar[volume]-muted]
$endif

$onlyIf[$voiceID[$clientID]==$voiceID;]
$onlyIf[$queueLength!=0;]
$onlyIf[$voiceID[$clientID]!=;]
    `}