const { links, illustrations, colors } = require("../../index");

module.exports.command = {
    name: "$alwaysExecute",
    code: `
$channelSendMessage[${links.channels.telemetry};

{description:\`\`\`
$replaceText[$replaceText[$replaceText[$message;$getServerVar[prefix] ;()];$getServerVar[prefix];()];\`;]\`\`\`}

{field:Platform:
$toLocaleUppercase[$platform]
:yes}

{field:User ID:
$authorID
:yes}

$if[$checkContains[$checkCondition[$getGlobalUserVar[lastCmd]==setname]$checkCondition[$getGlobalUserVar[lastCmd]==setbio];true]==true]

{field:Var \`$get[var]\` updated:
\`\`\`
$getGlobalUserVar[$get[var]]\`\`\`
:no}
{color:${colors.green}}

$let[var;$replaceText[$replaceText[$getGlobalUserVar[lastCmd];set;profile_];bio;about]]

$endif

]

$if[$getGlobalUserVar[lastCmd]!=help]
$setGlobalUserVar[helpSuggestions;$replaceText[$replaceText[$checkCondition[$get[a]==];true;basic];false;$get[a]]-$splitText[2]]
$textSplit[$getGlobalUserVar[helpSuggestions];-]
$endif

$let[a;$commandInfo[$toLowercase[$get[commandname]];module]]

$onlyIf[$commandInfo[$toLowercase[$get[commandname]];name]!=djseval;]
$onlyIf[$commandInfo[$toLowercase[$get[commandname]];name]!=eval;]

$let[commandname;$replaceText[$replaceText[ $message; $getServerVar[prefix] ;]; $getServerVar[prefix];]]

$onlyIf[$isBot[$authorID]==false;]
$onlyIf[$userExists[$authorID]==true;]

$onlyIf[$stringStartsWith[$message;$getServerVar[prefix]]==true;]

$if[$checkCondition[$messageAttachment==]$checkContains[$stringEndsWith[$messageAttachment;.png]$stringEndsWith[$messageAttachment;.jpg]$stringEndsWith[$messageAttachment;.jpeg];true]==falsetrue]
    $setChannelVar[lastAttach;$messageAttachment]
$endif

    `}
