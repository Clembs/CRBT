module.exports.command = {
    name: "avatar",
    aliases: ["pfp", "av"],
    module: "utility",
    description_enUS: "Retrieves a specified user's profile picture in multiple resolutions and formats. Returns yours if no arguments are used.",
    description_enUK: "Gets a specified user's profile picture in multiple resolutions and formats. You can also get your own if you do not give a user.",
    description_frFR: "Récupère l'image de la photo de profil d'un utilisateur spécifié en résolutions et formats multiples. Montre la vôtre si personne n'est spécifié.",
    description_ru: "Возвращает аватар указанного пользователя в нескольких разрешениях и форматах. Возвращает ваш, если не были указаны аргументы.",
    usage_enUS: "<user ID | username | @mention> (optional)",
    usage_enUK: "<User ID  |  Username  |  @mention> (optional)",
    usage_frFR: "<ID utilisateur | nom d'utilisateur | @mention> (optionnel)",
    usage_ru: "<ID пользователя | имя пользователя | @упоминание> (Необязательно)",
    botperms: "",
    code: `
$reply[$messageID;
{author:$get[title-$getGlobalUserVar[language]]:$userAvatar[$findUser[$message];64]}

{field:$get[res-$getGlobalUserVar[language]]:
**[4096]($replaceText[$userAvatar[$get[id];4096;yes];webp;png])** | **[2048]($replaceText[$userAvatar[$get[id];2048;yes];webp;png])** | **[1024]($replaceText[$userAvatar[$get[id];1024;yes];webp;png])** | **[512]($replaceText[$userAvatar[$get[id];512;yes];webp;png])** | **[256]($replaceText[$userAvatar[$get[id];256;yes];webp;png])** | **[128]($replaceText[$userAvatar[$get[id];128;yes];webp;png])**
:no}

{field:$get[formats-$getGlobalUserVar[language]]:
**[PNG]($replaceText[$replaceText[$userAvatar[$get[id];512;yes];gif;png];webp;png])** | **[WEBP]($replaceText[$userAvatar[$get[id];512;yes];gif;webp])** | **[JPG]($replaceText[$replaceText[$userAvatar[$get[id];512;yes];gif;jpg];webp;jpg]) $replaceText[$replaceText[$checkContains[$userAvatar[$get[id];512;yes];.gif];true;| [GIF]($replaceText[$userAvatar[$get[id];512;yes];webp;gif])];false;]**
:no}

{image:$replaceText[$userAvatar[$get[id];2048;yes];webp;png]}

{color:$getGlobalUserVar[color]}
;no]

$let[title-enUS;$userTag[$get[id]] - Profile picture]
$let[res-enUS;Resolutions (in pixels)]
$let[formats-enUS;Formats]

$let[title1-enUK;$userTag[$get[id]] - Profile picture]
$let[res-enUK;Resolutions in pixels]
$let[formats-enUS;File formats]

$let[title1-frFR;$userTag[$get[id]] - Photo de profil]
$let[res-frFR;Résolutions (en pixels)]
$let[formats-frFR;Formats]

$let[title1-ru;Аватар $userTag[$get[id]]]
$let[res-ru;Разрешение (в пикселях)]
$let[formats-ru;Форматы]

$if[$message==]
    $let[id;$authorID]
$else
    $let[id;$findUser[$message]]
    $onlyIf[$findUser[$message;no]!=undefined;{execute:usernotfound}]
$endif

$setGlobalUserVar[lastCmd;$commandName]
$onlyIf[$getGlobalUserVar[blocklisted]==false;{execute:blocklist}]
$onlyIf[$getServerVar[module_$commandInfo[$commandName;module]]==true;{execute:module}]
$if[$guildID!=] $onlyIf[$hasPermsInChannel[$channelID;$clientID;embedlinks]==true;{execute:embeds}] $endif
    `}