module.exports.command = {
    name: "$alwaysExecute",
    code: `
$useChannel[775431942786908160]

$if[$getGlobalUserVar[telemetry]==complete]

    $if[$checkContains[$message[1];$getServerVar[prefix]]==true]
        
        $description[\`\`\`
$replaceText[$replaceText[$message;$getServerVar[prefix];()];\`;]\`\`\`]

        $addField[Platform;$toLocaleUppercase[$platform];yes]
        $addField[User ID;$authorID;yes]
        $addField[Type;$replaceText[$replaceText[$checkCondition[$guildID==];false;Server];true;DM];yes]

    $elseIf[$mentioned[1]==$clientID]

        $description[\`\`\`
$replaceText[$replaceText[$message;$getServerVar[prefix];()];\`;]\`\`\`]

        $addField[Platform;$toLocaleUppercase[$platform];yes]
        $addField[User ID;$authorID;yes]
        $addField[Type;$replaceText[$replaceText[$checkCondition[$guildID==];false;Server];true;DM];yes]

    $endelseif
    $endif

$else

    $if[$checkContains[$message[1];$getServerVar[prefix]]==true]
            
\`\`\`
()$get[commandname]\`\`\`

    $elseIf[$mentioned[1]==$clientID]

\`\`\`
()$get[commandname]\`\`\`

    $endelseif
    $endif

$endif

$let[commandname;$replaceText[$replaceText[$message[1];<@!$clientID>;];$getServerVar[prefix];]]

$onlyIf[$isBot[$authorID]==false;]
$onlyIf[$userExists[$authorID]==true;]
$onlyIf[$checkContains[$message[1];eval;e]==false;]

$textSplit[$message[1];]
    `}