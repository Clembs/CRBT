module.exports.command = {
    name: "sex",
    description_enUS: "the sex command <:dorime:672820709436686355>",
    module: "partnerCmd",
    cooldown: "1s",
    server: "782584672298729473",
    code: `
$setGlobalUserVar[sexlogs;<@!$randomUserID>$getGlobalUserVar[sexlogs]]

$reply[$messageID;
{title:sex status}

{description:You just $randomText[ ; ;brutally ; ; ; ;]sexed <@!$randomUserID>!!}

{field:Virgnity level:
$random[-200;1000]%
:yes}

{field:Recent activity:
You $replaceText[$replaceText[$checkCondition[$get[sexcount]==1];true;only];false;] have sexed $get[sexcount] $replaceText[$replaceText[$checkCondition[$get[sexcount]==1];true;person];false;people]!

<@!$randomUserID>
$replaceText[$replaceText[$checkCondition[$splitText[1]==];false;$splitText[1]>];true;]
$replaceText[$replaceText[$checkCondition[$splitText[2]==];false;$splitText[2]>];true;]
$replaceText[$replaceText[$checkCondition[$splitText[3]==];false;$splitText[3]>];true;]
$replaceText[$replaceText[$checkCondition[$splitText[4]==];false;$splitText[4]>];true;]
$replaceText[$replaceText[$checkCondition[$splitText[5]==];false;And $sub[$get[sexcount];5] other(s) people...];true;]
:no}

{color:$getGlobalUserVar[color]}
;no]

$let[sexcount;$math[1+$replaceText[$replaceText[$checkContains[$getGlobalUserVar[sexlogs];<@!];false;0];true;$charCount[$replaceText[$replaceText[$getGlobalUserVar[sexlogs];<@!;];>;]]]/18]]

$textSplit[$replaceText[$getGlobalUserVar[sexlogs];>;AAA];AAA]

$globalCooldown[$commandInfo[$commandName;cooldown];{execute:cooldown}]
$setGlobalUserVar[lastCmd;$commandName]
$onlyIf[$getGlobalUserVar[blocklisted]==false;{execute:blocklist}]
$if[$guildID!=] $onlyIf[$hasPermsInChannel[$channelID;$clientID;embedlinks]==true;{execute:embeds}] $endif
$onlyForServers[$commandInfo[$commandName;server];]
`}