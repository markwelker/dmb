const Discord = require('discord.js');
const client = new Discord.Client();

ROLL_MESSAGE = '!roll [quantity]d[size][+-modifier]';
HELP_MESSAGE = 	'Command syntax goes as follows: !command [option 1][opt 2] (results)\n' + 
				'!help (displays this again)\n' +
				ROLL_MESSAGE + '\n';

client.on('message', message => {
	content = message.content
	if (content[0] === '!' && !message.author.bot) {
		// send back "Pong." to the channel the message was sent in
		if (content.startsWith('!help')) {
			message.channel.send(HELP_MESSAGE);
		}
		if (content.startsWith('!roll')) {
			result = roll(content)
			if (result === false)
				message.channel.send('syntax: ' + ROLL_MESSAGE);
			else 
				message.channel.send(result);
		}
		if (content.startsWith('!flip')) {
			result = rand(1, 2);
			if (result === 0)
				message.channel.send('Heads!');
			else 
				message.channel.send('Tails!');
		}
		else if (content.startsWith('!test') || content.startsWith('!bot')) {
			message.channel.send('Beep Boop. I\'m a bot.');
		}
		console.log(message.content);
	}
});

client.once('ready', () => {
	console.log('Ready!');
});

client.login('NTE0NTU3MzM5OTI4MzYzMDE3.DtdPiQ.NUCYVeN2WEuFeO0tqlY0zxb6RVs');


/******************************** Functions ********************************/

/**
 * @param {int} quantity	Number of dice rolled
 * @param {int} size 		Size of the dice
 * @param {int} modifier 	Modifier of total roll, positive or negative allowed.
 */
function rand(quantity = 1, size = 20, modifier = 0) {
	total = 0;
	for (i=0; i<quantity; i++) {
		total+= Math.floor(size * Math.random()) + 1;
	}
	return total + modifier;
}

/**
 * 
 * @param {string} content Full message the bot received, already parsed for !roll
 */
function roll(content) {
	content = content.replace(/\s+/g, ''); 
	length = content.length;
	index = 5  // Will always look at the next character in content. '!roll' has 5 chars
	if (length == index)
		return rand();
	try {
		quantity = parseInt(content.substring(index))
		index += Math.floor(quantity / 10) + 2;
		console.log(quantity);
		size = parseInt(content.substring(index));
		console.log(size);
		if (isNaN(quantity) || isNaN(size))
			return false;
		else 
			return rand(quantity, size);
	} catch (e) {
		return false;
	}
}