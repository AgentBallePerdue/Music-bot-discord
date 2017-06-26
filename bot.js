var errorlog = require("./data/errors.json");
const Discord = require("discord.js"),
con = console.log,
git = require('git-rev');

git.short(commit => git.branch(branch => {
  console.log(`Emilia#${branch}@${commit}`);
}));
const CURRENT_REV = "0.1.6";
try {
    var config = require('./config.json'),
    language = config.language;
    if (language == "fr") {
    con("Config file detected! \nFrench language detected. Logs are still in English.");
    } else if (language == "en") {
        con("Config file detected! \n English language detected.");
    } else {
        con("Config file detected! \n Language could not be detected. Defaulting to English.");
    }
} catch (err) {
    con(err);
    if(language == 'fr'){
    con("No config detected, attempting to use environment variables...");
    }else {
    con("No config detected, attempting to use environment variables...");
    }
    if (process.env.MUSIC_BOT_TOKEN && process.env.YOUTUBE_API_KEY) {
        var config = {
            "token": process.env.MUSIC_BOT_TOKEN,
            "client_id": "",
            "prefix": "!",
            "owner_id": "193090359700619264",
            "status": "Musicccc",
            "youtube_api_key": process.env.YOUTUBE_API_KEY,
            "admins": ["193090359700619264"],
            "language" : "en"
        }
    } else {
        con("No token passed! Exiting...")
        process.exit(0)
    }
}
const admins = config.admins,
client = new Discord.Client(),
prefix = config.prefix,
fs = require("fs"),
queues = {},
ytdl = require('ytdl-core'),
search = require('youtube-search'),
opts = {
    part: 'snippet',
    maxResults: 10,
    key: config.youtube_api_key
}
var intent;

function getQueue(guild) {
    if (!guild) return
    if (typeof guild == 'object') guild = guild.id
    if (queues[guild]) return queues[guild]
    else queues[guild] = []
    return queues[guild]
}

function getRandomInt(max) {
    return Math.floor(Math.random() * (max + 1));
}

var paused = {}

//Fix dis shit
function getRandomMusic(queue, msg) {
    fs.readFile('./data/autoplaylist.txt', 'utf8', function(err, data) {
        if (err) throw err;
        con('OK: autoplaylist.txt');
        var random = data.split('\n');
        var num = getRandomInt(random.length);
        con(random[num])
        var url = random[num];
        msg.author.username = "AUTOPLAYLIST";
        play(msg, queue, url)
    });
}

function play(msg, queue, song) {
    try {
        if (!msg || !queue) return;
        if (song) {
            search(song, opts, function(err, results) {
                if(language == "fr"){
                if (err) return msg.channel.send("Vidéo non trouvée, essayez d'utiliser un lien à youtube à la place."); 
                }else{
                if (err) return msg.channel.send("Video not found please try to use a youtube link instead.");
                }
                song = (song.includes("https://" || "http://")) ? song : results[0].link
                let stream = ytdl(song, {
                    audioonly: true
                })
                let test
                if (queue.length === 0) test = true
                    con(song);
                queue.push({
                    "title": results[0].title,
                    "requested": msg.author.username,
                    "toplay": stream
                })
            if(language == "fr"){
                con("Queued " + queue[queue.length - 1].title + " dans " + msg.guild.name + " demandé par " + queue[queue.length - 1].requested)
            }else{
                con("Queued " + queue[queue.length - 1].title + " in " + msg.guild.name + " as requested by " + queue[queue.length - 1].requested)                
            }
                msg.channel.send({
                embed: {
                    author: {
                        name: client.user.username,
                        icon_url: client.user.avatarURL,
                        url: "https://emilia-bot.xyz"
                    },
                    color: 0x00FF00,
                    title: `Queued`,
                    description: "**" + queue[queue.length - 1].title + "**"
                }
                    }).then(response => { response.delete(5000) });
                if (test) {
                    setTimeout(function() {
                        play(msg, queue)
                    }, 1000)
                }
            })
        } else if (queue.length != 0) {
            if(language == 'fr'){
        msg.channel.send({
        embed: {
            author: {
                name: client.user.username,
                icon_url: client.user.avatarURL,
                url: "https://emilia-bot.xyz"
            },
            color: 0x00FF00,
            title: `Lecture en cours`,
            description: `**${queue[0].title}** | Demande par ***${queue[0].requested}***`
        }
            }).then(response => { response.delete(5000) });
            con(`Lecture ${queue[0].title} demandé par ${queue[0].requested} dans ${msg.guild.name}`);
            client.user.setGame(queue[0].title);
            let connection = msg.guild.voiceConnection
            if (!connection) return con("Pas de connexion!");
            intent = connection.playStream(queue[0].toplay)

            intent.on('error', () => {
                queue.shift()
                play(msg, queue)
            })

            intent.on('end', () => {
                queue.shift()
                play(msg, queue)
            })
            }else{
        msg.channel.send({
        embed: {
            author: {
                name: client.user.username,
                icon_url: client.user.avatarURL,
                url: "https://emilia-bot.xyz"
            },
            color: 0x00FF00,
            title: `Now Playing`,
            description: `**${queue[0].title}** | Requested by ***${queue[0].requested}***`
        }
            }).then(response => { response.delete(5000) });
            con(`Playing ${queue[0].title} as requested by ${queue[0].requested} in ${msg.guild.name}`);
            client.user.setGame(queue[0].title);
            let connection = msg.guild.voiceConnection
            if (!connection) return con("No Connection!");
            intent = connection.playStream(queue[0].toplay)

            intent.on('error', () => {
                queue.shift()
                play(msg, queue)
            })

            intent.on('end', () => {
                queue.shift()
                play(msg, queue)
            })
            }
        } else {
            if(language == "fr"){
            msg.channel.send('Plus de musique dans la file d\'attente! Démarrage de la liste de lecture automatique').then(response => { response.delete(5000) });
            getRandomMusic(queue, msg);
            }else{
            msg.channel.send('No more music in queue! Starting autoplaylist').then(response => { response.delete(5000) });
            getRandomMusic(queue, msg);    
            }
        }
    } catch (err) {
        if(language =="fr"){
        con("BIEN LADS COMPREND QUE QUELQUE FOIS A ÉTÉ MAL! Visitez le serveur de vidéos Joris pour obtenir de l'assistance (https://discord.gg/E8tXHqC) et citez cette erreur:\n\n\n" + err.stack)
        errorlog[String(Object.keys(errorlog).length)] = {
            "code": err.code,
            "error": err,
            "stack": err.stack
        }
        fs.writeFile("./data/errors.json", JSON.stringify(errorlog), function(err) {
            if (err) return con("Pire encore, nous ne pouvions pas écrire dans notre fichier journal d'erreur! Assurez-vous que data / errors.json existe toujours!");
        });
        }else{
        con("WELL LADS LOOKS LIKE SOMETHING WENT WRONG! Visit Joris vidéo server for support (https://discord.gg/E8tXHqC) and quote this error:\n\n\n" + err.stack)
        errorlog[String(Object.keys(errorlog).length)] = {
            "code": err.code,
            "error": err,
            "stack": err.stack
        }
        fs.writeFile("./data/errors.json", JSON.stringify(errorlog), function(err) {
            if (err) return con("Even worse we couldn't write to our error log file! Make sure data/errors.json still exists!");
        });
        }

    }
}
function isCommander(id) {
	if(id === config.owner_id) {
		return true;
	}
	for(var i = 0; i < admins.length; i++){
		if(admins[i] == id) {
			return true;
		}
	}
	return false;
}

client.on('ready', function() {
    try {
        config.client_id = client.user.id;
        client.user.setStatus('online', config.status)
        if (language == "fr") {
            var msg = `
------------------------------------------------------
> version 0.1.6
> Faites 'git pull' périodiquement pour garder votre bot à jour!
> Connexion en cours ...
------------------------------------------------------
Connecté en tant que ${client.user.username} [ID ${client.user.id}]
Present dans ${client.guilds.size} serveurs !
Present dans ${client.channels.size} channels et ${client.users.size} utilisateurs en cache!
Creer par Silver Crow
Bot est connecté et prêt à jouer des morceaux!
Allons-y
------------------------------------------------------`
}else{
        var msg = `
------------------------------------------------------
> version 0.1.6
> Do 'git pull' periodically to keep your bot updated! 
> Logging in...
------------------------------------------------------
Logged in as ${client.user.username} [ID ${client.user.id}]
On ${client.guilds.size} servers!
${client.channels.size} channels and ${client.users.size} users cached!
Created by Silver Crow
Bot is logged in and ready to play some tunes!
LET'S GO!
------------------------------------------------------`
}


    con(msg)
var errsize = Number(fs.statSync("./data/errors.json")["size"])
    if (language == "fr") {
        con("La taille actuelle du journal des erreurs est de " + errsize + " Octets") 
    }else{
        con("Current error log size is " + errsize + " Bytes") }
        if (errsize > 5000) {
            errorlog = {}
            fs.writeFile("./data/errors.json", JSON.stringify(errorlog), function(err) {
                if (language == "fr"){
                    if (err) return con("Uh oh, nous n'avons pas pu effacer le journal des erreurs");
                    con("Juste pour dire, nous avons effacé le journal des erreurs sur votre système car sa taille était trop grande")
                }else{
                if (err) return con("Uh oh we couldn't wipe the error log");
                    con("Just to say, we have wiped the error log on your system as its size was too large")}
            })
        }
        con("------------------------------------------------------")
    } catch (err) {
        if (language == "fr"){
            con("BIEN LADS COMPREND QUE QUELQUE FOIS A ÉTÉ MAL! Visitez Joris vidéo pour obtenir de l'aide (https://discord.gg/E8tXHqC) et indiquez cette erreur:\n\n\n" + err.stack)
        }else{
        con("WELL LADS LOOKS LIKE SOMETHING WENT WRONG! Visit Joris vidéo for support (https://discord.gg/E8tXHqC) and quote this error:\n\n\n" + err.stack)
        }
        errorlog[String(Object.keys(errorlog).length)] = {
            "code": err.code,
            "error": err,
            "stack": err.stack
        }
        fs.writeFile("./data/errors.json", JSON.stringify(errorlog), function(err) {
            if (language == "fr"){
            if (err) return con("Pire encore, nous ne pouvions pas écrire dans notre fichier journal d'erreur! Assurez-vous que data / errors.json existe toujours!");

            }else{
            if (err) return con("Even worse we couldn't write to our error log file! Make sure data/errors.json still exists!");
            }
        })

    }
})

client.on('voiceStateUpdate', function(oldMember, newMember) {
	var svr = client.guilds.array()
    for (var i = 0; i < svr.length; i++) {
        if (svr[i].voiceConnection) {
            if (paused[svr[i].voiceConnection.channel.id]) {
                if (svr[i].voiceConnection.channel.members.size > 1) {
					paused[svr[i].voiceConnection.channel.id].player.resume()
					var game = client.user.presence.game.name;
                    delete paused[svr[i].voiceConnection.channel.id]
                    game = game.split("⏸")[1];
					client.user.setGame(game);
                }
            }
            if (svr[i].voiceConnection.channel.members.size === 1 && !svr[i].voiceConnection.player.dispatcher.paused) {
                svr[i].voiceConnection.player.dispatcher.pause();
                var game = client.user.presence.game.name;
                paused[svr[i].voiceConnection.channel.id] = {
                    "player": svr[i].voiceConnection.player.dispatcher
                }
                client.user.setGame("⏸ " + game);
            }
        }
    }
});

client.on("message", function(msg) {
    const msga = msg.content;
    try {
		if (msg.channel.type === "dm") return;
        if (msg.author === client.user)
        if(language == 'fr'){
            if (msg.guild === undefined) {
                msg.channel.send("Le bot ne fonctionne que dans les serveurs!")

                return;
            }
        }else{
            if (msg.guild === undefined) {
                msg.channel.send("The bot only works in servers!")

                return;
            }
        }
        if (msga.startsWith(prefix + 'play')) {
            if (!msg.guild.voiceConnection) {
                if(language == "fr"){
                if (!msg.member.voiceChannel) return msg.channel.send('Vous devez être dans un channel vocal')
                }else{
                if (!msg.member.voiceChannel) return msg.channel.send('You need to be in a voice channel')
                }
                var chan = msg.member.voiceChannel
                chan.join()
            }
            let suffix = msga.split(" ").slice(1).join(" ")
            if(language == "fr"){
            if (!suffix) return msg.channel.send('Vous devez spécifier un lien pour le morceau ou un nom de musique!')
            }else{
            if (!suffix) return msg.channel.send('You need to specify a song link or a song name!')
            }

            play(msg, getQueue(msg.guild.id), suffix)
        }
        if (msga.startsWith(prefix + 'leave')) {
            if (!msg.guild.voiceConnection) {
            con('leave');
                if(language == "fr"){
                if (!msg.member.voiceChannel) return msg.channel.send('Vous devez être dans un channel vocal')
                }else{
                if (!msg.member.voiceChannel) return msg.channel.send('You need to be in a voice channel')
                }
                if(language == "fr"){
                msg.member.voiceChannel.leave();
                let queue = getQueue(msg.guild.id);
                if (queue.length == 0) return msg.channel.send(`Pas de music dans la queue`).then(response => { response.delete(5000) });
                for (var i = queue.length - 1; i >= 0; i--) {
                    queue.splice(i, 1);
                }
                msg.channel.send(`La file d'attente à bien été effacer`).then(response => { response.delete(5000) });

                }else{
                msg.member.voiceChannel.leave();
                let queue = getQueue(msg.guild.id);
                if (queue.length == 0) return msg.channel.send(`No music in queue`).then(response => { response.delete(5000) });
                for (var i = queue.length - 1; i >= 0; i--) {
                    queue.splice(i, 1);
                }
                msg.channel.send(`Cleared the queue`).then(response => { response.delete(5000) });
            }
            }
        }
        if (msga.startsWith(prefix +`infomusic`)) {
            if(language == "fr"){
            git.short(commit => git.branch(branch => {
              msg.channel.send(`Version: \`Emilia#${branch}@${commit}\` (cf: ${config.configRev} cr: ${CURRENT_REV}). Vous trouverez des informations sur le bot de musique Emilia à l'adresse https://github.com/Jorisvideo/emilia-musicbot.`);
            }));  
            }else{
            git.short(commit => git.branch(branch => {
              msg.channel.send(`Version: \`Emilia#${branch}@${commit}\` (cf: ${config.configRev} cr: ${CURRENT_REV}). Info about Emilia music bot can be found at https://github.com/Jorisvideo/emilia-musicbot.`);
            }));
            }
        }
        if (msga.startsWith(prefix + "clear")) {
            if (msg.guild.owner.id == msg.author.id || msg.author.id == config.owner_id || config.admins.indexOf(msg.author.id) != -1 || msg.channel.permissionsFor(msg.member).hasPermission('MANAGE_SERVER')) {
                let queue = getQueue(msg.guild.id);
                if(language == "fr"){
                if (queue.length == 0) return msg.channel.send(`Pas de music dans la queue`).then(response => { response.delete(5000) });
                }else{
                if (queue.length == 0) return msg.channel.send(`No music in queue`).then(response => { response.delete(5000) });
                }
                for (var i = queue.length - 1; i >= 0; i--) {
                    queue.splice(i, 1);
                }
                if(language == "fr"){
                msg.channel.send(`La file d'attente à bien été effacer`).then(response => { response.delete(5000) })
                }else{
                msg.channel.send(`Cleared the queue`).then(response => { response.delete(5000) })
                }
            } else {
                if(language == "fr"){
                msg.channel.send('Seul les admins peuvent utilisé cette commande').then(response => { response.delete(5000) });
                }else{
                msg.channel.send('Only the admins can do this command').then(response => { response.delete(5000) });
                }
            }
        }

        if (msga.startsWith(prefix + 'skip')) {
            if(language == "fr"){//traduction FR
        if (!msg.member.voiceChannel) return msg.channel.send('Vous devez être dans un channel vocal')
                let player = msg.guild.voiceConnection.player.dispatcher
                if (!player || player.paused) return msg.channel.send("Bot ne joue pas!").then(response => { response.delete(5000) });
                msg.channel.send('Changement de la chanson ...').then(response => { response.delete(5000) });
                player.end()
            }else{//traduction EN
                        if (!msg.member.voiceChannel) return msg.channel.send('You need to be in a voice channel')
                let player = msg.guild.voiceConnection.player.dispatcher
                if (!player || player.paused) return msg.channel.send("Bot is not playing!").then(response => { response.delete(5000) });
                msg.channel.send('Skipping song...').then(response => { response.delete(5000) });
                player.end()
            }

        }

        if (msga.startsWith(prefix + 'pause')) {
            if (msg.guild.owner.id == msg.author.id || msg.author.id == config.owner_id || config.admins.indexOf(msg.author.id) != -1) {
                if(language == "fr"){
                    if (!msg.member.voiceChannel) return msg.channel.send('Vous devez être dans un channel vocal').then(response => { response.delete(5000) });
                    let player = msg.guild.voiceConnection.player.dispatcher
                    if (!player || player.paused) return msg.channel.send("Bot ne joue pas!").then(response => { response.delete(5000) });
                    player.pause();
                    msg.channel.send("Musique en pause...").then(response => { response.delete(5000) });
                }else{
                    if (!msg.member.voiceChannel) return msg.channel.send('You need to be in a voice channel').then(response => { response.delete(5000) });
                    let player = msg.guild.voiceConnection.player.dispatcher
                    if (!player || player.paused) return msg.channel.send("Bot is not playing").then(response => { response.delete(5000) });
                    player.pause();
                    msg.channel.send("Pausing music...").then(response => { response.delete(5000) }); 
                }
               
            } else {
                if(language == "fr"){
                msg.channel.send('Seul les admins peuvent utilisé cette commande').then(response => { response.delete(5000) });
                }else{
                msg.channel.send('Only admins can use this command!').then(response => { response.delete(5000) });
                }
            }
        }
        if (msga.startsWith(prefix + 'volume')) {
            let suffix = msga.split(" ")[1];
                        if(language == "fr"){
            var player = msg.guild.voiceConnection.player.dispatcher
            if (!player || player.paused) return msg.channel.send('Pas de Musique m8, Ajouté en avec la commandes `' + prefix + 'play`');
            }else{
            var player = msg.guild.voiceConnection.player.dispatcher
            if (!player || player.paused) return msg.channel.send('No music m8, queue something with `' + prefix + 'play`');
            }
            if (!suffix) {
                if(language=='fr'){
                msg.channel.send(`Le volume actuelle est de ${(player.volume * 100)}`).then(response => { response.delete(5000) });
                }else{
                msg.channel.send(`The current volume is ${(player.volume * 100)}`).then(response => { response.delete(5000) });
                }
            } else if (msg.guild.owner.id == msg.author.id || msg.author.id == config.owner_id || config.admins.indexOf(msg.author.id) != -1) {
                let volumeBefore = player.volume
                let volume = parseInt(suffix);
                if(language=='fr'){
                if (volume > 100) return msg.channel.send("La musique ne peut pas être supérieure à 100").then(response => { response.delete(5000) });
                player.setVolume((volume / 100));
                msg.channel.send(`Le volume a changé de ${(volumeBefore * 100)} à ${volume}`).then(response => { response.delete(5000) });
                }else{
                if (volume > 100) return msg.channel.send("The music can't be higher then 100").then(response => { response.delete(5000) });
                player.setVolume((volume / 100));
                msg.channel.send(`Volume changed from ${(volumeBefore * 100)} to ${volume}`).then(response => { response.delete(5000) });
                }
            } else {
                if(language == "fr"){
                msg.channel.send('Seul les admins peuvent changé le volume').then(response => { response.delete(5000) });
                }else{
                msg.channel.send('Only admins can change the volume!').then(response => { response.delete(5000) });
                }
            }
        }

        if (msga.startsWith(prefix + 'resume')) {
            if (msg.guild.owner.id == msg.author.id || msg.author.id == config.owner_id || config.admins.indexOf(msg.author.id) != -1) {
                if(language == "fr"){
                if (!msg.member.voiceChannel) return msg.channel.send('Vous devez être dans un channel vocal').then(response => { response.delete(5000) });
                let player = msg.guild.voiceConnection.player.dispatcher
                if (!player) return msg.channel.send('Aucune musique ne joue à ce moment.').then(response => { response.delete(5000) });
                if (player.playing) return msg.channel.send('La musique joue déjà').then(response => { response.delete(5000) });
                }else{
                if (!msg.member.voiceChannel) return msg.channel.send('You need to be in a voice channel').then(response => { response.delete(5000) });
                let player = msg.guild.voiceConnection.player.dispatcher
                if (!player) return msg.channel.send('No music is playing at this time.').then(response => { response.delete(5000) });
                if (player.playing) return msg.channel.send('The music is already playing').then(response => { response.delete(5000) });
                }
                var queue = getQueue(msg.guild.id);
                client.user.setGame(queue[0].title);
                player.resume();
                if(language=='fr'){
                msg.channel.send("Reprise de la musique ...").then(response => { response.delete(5000) });
                }else{
                msg.channel.send("Resuming music...").then(response => { response.delete(5000) });
                }
            } else {
                if(language=="fr"){
                msg.channel.send('Seuls les administrateurs peuvent effectuer cette commande').then(response => { response.delete(5000) });
                }else{
                msg.channel.send('Only admins can do this command').then(response => { response.delete(5000) });                    
                }
            }
        }

        if (msga.startsWith(prefix + 'current') || msga.startsWith(prefix + 'nowplaying')) {
            let queue = getQueue(msg.guild.id);
            if(language =='fr'){
            if (queue.length == 0) return msg.channel.send(msg, "Pas de musique dans la queue");
            msg.channel.send({
                embed: {
                    author: {
                        name: client.user.username,
                        icon_url: client.user.avatarURL,
                        url: "https://emilia-bot.xyz"
                    },
                    color: 0x00FF00,
                    title: `Lecture actuelle`,
                    description: `${queue[0].title} | par ${queue[0].requested}`
                }
            }).then(response => { response.delete(5000) });
            }else{
            if (queue.length == 0) return msg.channel.send(msg, "No music in queue"); 
            msg.channel.send({
                embed: {
                    author: {
                        name: client.user.username,
                        icon_url: client.user.avatarURL,
                        url: "https://emilia-bot.xyz"
                    },
                    color: 0x00FF00,
                    title: `Currently playing`,
                    description: `${queue[0].title} | by ${queue[0].requested}`
                }
            }).then(response => { response.delete(5000) });
            }     
        }

        if (msga.startsWith(prefix + 'queue')) {
            let queue = getQueue(msg.guild.id);
            if(language == "fr"){
            if (queue.length == 0) return msg.channel.send("Pas de musique dans la queue");
            let text = '';
            for (let i = 0; i < queue.length; i++) {
                text += `${(i + 1)}. ${queue[i].title} | demandé par ${queue[i].requested}\n`
            };
            msg.channel.send({
                embed: {
                    author: {
                        name: client.user.username,
                        icon_url: client.user.avatarURL,
                        url: "https://emilia-bot.xyz"
                    },
                    color: 0x00FF00,
                    title: `Queue`,
                    description: `\n${text}`
                }
            }).then(response => { response.delete(5000) });
            }else{
            if (queue.length == 0) return msg.channel.send("No music in queue");
            let text = '';
            for (let i = 0; i < queue.length; i++) {
                text += `${(i + 1)}. ${queue[i].title} | requested by ${queue[i].requested}\n`
            };
            msg.channel.send({
                embed: {
                    author: {
                        name: client.user.username,
                        icon_url: client.user.avatarURL,
                        url: "https://emilia-bot.xyz"
                    },
                    color: 0x00FF00,
                    title: `Queue`,
                    description: `\n${text}`
                }
            }).then(response => { response.delete(5000) });
            }
        }
    } catch (err) {
        if(language == "fr"){
        con("BIEN LADS COMPREND QUE QUELQUE FOIS A ÉTÉ MAL! Visitez Joris Video et citez cette erreur:\n\n\n" + err.stack)
        errorlog[String(Object.keys(errorlog).length)] = {
            "code": err.code,
            "error": err,
            "stack": err.stack
        }
        fs.writeFile("./data/errors.json", JSON.stringify(errorlog), function(err) {
            if (err) return con("Pire encore, nous ne pouvions pas écrire dans notre fichier journal d'erreur! Assurez-vous que data / errors.json existe toujours!");
        })
        }else{
        con("WELL LADS LOOKS LIKE SOMETHING WENT WRONG! Visit Joris Video and quote this error:\n\n\n" + err.stack)
        errorlog[String(Object.keys(errorlog).length)] = {
            "code": err.code,
            "error": err,
            "stack": err.stack
        }
        fs.writeFile("./data/errors.json", JSON.stringify(errorlog), function(err) {
            if (err) return con("Even worse we couldn't write to our error log file! Make sure data/errors.json still exists!");
        })
        }


    } if (language == "fr") {
        if (msga === '!aide') {
            msg.channel.send("Bonjour! Je m'appelle Emilia-bot-music!\nVoici ma liste de commandes:\n`!aide`: Pour savoir ma liste de commandes.\n`!aide \nEnjoy!");
            }
        }
    if (language == "en") {
        if (msga === "!help") {
            msg.channel.send("Hi! My name is Emilia-bot-music!\nHere is my command list:\n`!help`: To know my command list.\n`!help \n :) \nEnjoy!");
            }
        }
})

client.login(config.token)

process.on("unhandledRejection", err => {
    if(language == "fr"){
    console.error("Uncaught Nous avons eu une erreur de promesse, si cela continue d'être reporté sur dev server: \n" + err.stack);
    }else{
    console.error("Uncaught We had a promise error, if this keeps happening report to dev server: \n" + err.stack);
    }
});
