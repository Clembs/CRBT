const { botinfo, links, illustrations } = require("../../../index");

module.exports.command = {
  name: "crbtinfo",
  module: "misc",
  aliases: ["crbti", "crbt", "bi", "botinfo", "bot-info", "bot_info", "crbt-info", "crbt_info", "stats", "info"],
  description_enUS: "Gives detailed information and news about <botname>.",
  description_enUK: "Sends detailed information and the latest news of <botname>",
  description_frFR: "Présente des informations détaillées et actualités sur <botname>.",
  description_ru: "Даёт подробную информацию и новости о <botname>",
  code: `
$reply[$messageID;  
  {author:$get[title-$getGlobalUserVar[language]]:$userAvatar[$clientID;64]}

  {description:
  $get[description-$getGlobalUserVar[language]]
  }

  {field:$get[members-$getGlobalUserVar[language]]:yes}

  {field:$get[servers-$getGlobalUserVar[language]]:yes}

  {field:$get[creationDate-$getGlobalUserVar[language]]:yes}

  {field:$get[ping-$getGlobalUserVar[language]]:yes}

  {field:$get[uptime-$getGlobalUserVar[language]]:yes}

  {field:$get[computer-$getGlobalUserVar[language]]:yes}

  {thumbnail:$userAvatar[$clientID;512]}

  {color:$getGlobalUserVar[color]}
;no]

$let[title-enUS;$userTag[$clientID] - Information]
$let[description-enUS;**[Website](${links.baseURL})** | **[Add to Discord](${links.invite})** | **[Support server](${links.info.discord})** | **[Vote on top.gg](${links.vote.topgg})**
$replaceText[$replaceText[$checkCondition[$clientID==595731552709771264];false;Beta ${botinfo.build}];true;Stable ${botinfo.version}] | Created by **[Clembs](https://clembs.xyz)**]
$let[members-enUS;Members:$numberSeparator[$allMembersCount]]
$let[servers-enUS;Servers:$numberSeparator[$serverCount]]
$let[creationDate-enUS;Created on:<t:$formatDate[$creationDate[$clientID;date];X]> (<t:$formatDate[$creationDate[$clientID;date];X]:R>)]
$let[ping-enUS;Ping: Message: $pingms\nWS: $botPingms\nDatabase: $dbPingms]
$let[uptime-enUS;Uptime: $getObjectProperty[uptime]]
$let[computer-enUS;Server: Disk speed: $roundTenth[$divide[$divide[$multi[$ram;8];$divide[$ping;1000]];1000];2] GB/s\nRAM: $ram MB\nCPU: $cpu%\nHosted on $replaceText[$replaceText[$checkCondition[$clientID==595731552709771264];false;$username[$botOwnerID]'s $replaceText[$replaceText[$djsEval[require("os").platform();yes];win32;Windows PC];linux;Linux PC]];true;Club Hosting]]
$let[credits-enUS]
$let[news-enUS;Latest $username[$clientID] news: \`\`\`diff\n$replaceText[$replaceText[${botinfo.news};,;\n];();$getServerVar[prefix]]\n\`\`\`]

$let[title-enUK;$userTag[$clientID] - Bot Info]
$let[description-enUK;**[Website](${links.baseURL})** | **[Add to Server](${links.invite})** | **[Support server](${links.info.discord})** | **[Vote on top.gg](${links.vote.topgg})**
$replaceText[$replaceText[$checkCondition[$clientID==595731552709771264];false;Beta ${botinfo.build}];true;Stable ${botinfo.version}] | Created by **[Clembs](https://clembs.xyz)**]
$let[members-enUK;Members:$numberSeparator[$allMembersCount]]
$let[servers-enUK;Servers:$numberSeparator[$serverCount]]
$let[creationDate-enUK;Created on:<t:$formatDate[$creationDate[$clientID;date];X]> (<t:$formatDate[$creationDate[$clientID;date];X]:R>)]
$let[ping-enUK;Ping: Server: $pingms\nAPI: $replaceText[$getObjectProperty[final];-;]ms\nDatabase: $dbPingms]
$let[uptime-enUK;Uptime: $getObjectProperty[uptime]]
$let[computer-enUK;Server: Disk speed: $roundTenth[$divide[$divide[$multi[$ram;8];$divide[$ping;1000]];1000];2] GB/s\nRAM: $ram MB\nCPU: $cpu%\nHosted by $replaceText[$replaceText[$checkCondition[$clientID==595731552709771264];false;$username[$botOwnerID]'s $replaceText[$replaceText[$djsEval[require("os").platform();yes];win32;Windows PC];linux;Linux PC]];true;Club Hosting]]
$let[news-enUK;$username[$clientID] ${botinfo.build} news: \`\`\`diff\n$replaceText[$replaceText[${botinfo.news};,;\n];();$getServerVar[prefix]]\n\`\`\`]

$let[title-frFR;$userTag[$clientID] - Informations]
$let[description-frFR;**[Site web](${links.baseURL})** | **[Ajouter sur Discord](${links.invite})** | **[Serveur d'aide](${links.info.discord})** | **[Voter sur top.gg](${links.vote.topgg})**
$replaceText[$replaceText[$checkCondition[$clientID==595731552709771264];false;Beta ${botinfo.build}];true;Stable ${botinfo.version}] | Créé par **[Clembs](https://clembs.xyz)**]
$let[members-frFR;Members:$replaceText[$numberSeparator[$allMembersCount];,; ]]
$let[servers-frFR;Servers:$replaceText[$numberSeparator[$serverCount];,; ]]
$let[creationDate-frFR;Date de création:<t:$formatDate[$creationDate[$clientID;date];X]> (<t:$formatDate[$creationDate[$clientID;date];X]:R>)]
$let[ping-frFR;Ping: Serveur : $pingms\nAPI : $replaceText[$getObjectProperty[final];-;]ms\nDatabase : $dbPingms]
$let[uptime-frFR;Uptime: $replaceText[$replaceText[$replaceText[$replaceText[$getObjectProperty[uptime];second;seconde];day;jour];, and; et];hour;heure]]
$let[computer-frFR;Serveur: Vitesse du disque : $roundTenth[$divide[$divide[$multi[$ram;8];$divide[$ping;1000]];1000];2] Go/s\nMémoire vive : $ram Mo\nProcesseur : $cpu%\nHébergé par $replaceText[$replaceText[$checkCondition[$clientID==595731552709771264];false;$username[$botOwnerID]'s $replaceText[$replaceText[$djsEval[require("os").platform();yes];win32;Windows PC];linux;Linux PC]];true;Club Hosting]]
$let[news-frFR;Dernières nouveautés de $username[$clientID]: \`\`\`diff\n$replaceText[$replaceText[${botinfo.news};,;\n];();$getServerVar[prefix]]\n\`\`\`]

$let[title-ru;$userTag[$clientID] - информация]
$let[description-ru;**[Вебсайт](${links.baseURL})** | **[Добавить в Дискорд Сервер](${links.invite})** | **[Поддержать сервер](${links.info.discord})** | **[Проголосовать на top.gg](${links.vote.topgg})**
$replaceText[$replaceText[$checkCondition[$clientID==595731552709771264];false;Beta ${botinfo.build}];true;Stable ${botinfo.version}] | Created by **[Clembs](https://clembs.xyz)**]
$let[members-ru;Участников:$replaceText[$numberSeparator[$allMembersCount];,; ]]
$let[servers-ru;Серверов:$replaceText[$numberSeparator[$serverCount];,; ]]
$let[creationDate-ru;Создан:<t:$formatDate[$creationDate[$clientID;date];X]> (<t:$formatDate[$creationDate[$clientID;date];X]:R>)]
$let[ping-ru;Пинг: CRBT Сервер: $pingмс\nAPI: $replaceText[$getObjectProperty[final];-;]мс\nБаза Данных: $dbPingмс]
$let[uptime-ru;Время безотказной работы: $uptime]
$let[computer-ru;Сервер: Скорость ЖД: $roundTenth[$divide[$divide[$multi[$ram;8];$divide[$ping;1000]];1000];2] ГБ/с\nОЗУ: $ram MB\nМБ ЦП: $cpu%\nHosted by $replaceText[$replaceText[$checkCondition[$clientID==595731552709771264];false;$username[$botOwnerID]'s $replaceText[$replaceText[$djsEval[require("os").platform();yes];win32;Windows PC];linux;Linux PC]];true;Club Hosting]]
$let[news-ru;Последние новости $username[$clientID]: \`\`\`diff\n$replaceText[$replaceText[${botinfo.news};,;\n];();$getServerVar[prefix]]\n\`\`\`]

$djsEval[
let a = Date.now()
const ms = require('ms')
d.object.final = Math.floor(a - d.object.start)
d.object.owo = ms(a - d.object.start)
d.object.uwu = ms(d.object.botPing)

const tools = require('dbd.js-utils')
let theUptimeInMS = tools.parseToMS("$replaceText[$uptime; ;]")
d.object.uptime = tools.parseMS(theUptimeInMS)
]
$createObject[{"start": $dateStamp, "botPing": $botPing}]

$argsCheck[0;{execute:args}]
$onlyIf[$getGlobalUserVar[blocklisted]==false;{execute:blocklist}]
$onlyIf[$getServerVar[module_$commandInfo[$commandName;module]]==true;{execute:module}]
$if[$channelType!=dm] $onlyIf[$hasPermsInChannel[$channelID;$clientID;embedlinks]==true;{execute:embeds}] $endif
$setGlobalUserVar[lastCmd;$commandName]
  `}