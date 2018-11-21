const Discord = require('discord.js');
const { prefix, token } = require('./config.json');
const client = new Discord.Client();

const ROLL_MESSAGE = '!roll [quantity]d[size][+-modifier] (rolls quantity dice of given size) given quantity and size <= 100\n\t\tAlternatives: !rolladv and !rolldis for advantage and disadvantage.';
const FLIP_MESSAGE = '!flip (Flips a coin, heads or tails)';
const HELP_MESSAGE = 	'Command syntax goes as follows: !command [option 1][opt 2] (results)\n' + 
				'!help (displays this again)\n' +
				FLIP_MESSAGE + '\n' +
				ROLL_MESSAGE + '\n';

client.on('message', message => {
	content = message.content
	
	if (content[0] === prefix && !message.author.bot) {
		// send back "Pong." to the channel the message was sent in
		if (content.startsWith('!help')) {
			message.channel.send(HELP_MESSAGE);
		}
		/***************** Roll with Advantage *****************/
		if (content.startsWith('!rolladv')) {
			first = roll(content.substring(8))
			second = roll(content.substring(8))
			if (first === false)
				message.channel.send('syntax: ' + ROLL_MESSAGE);
			else
				message.channel.send(message.member.nickname + " rolled a " + first + " and " + second + 
										' for a higher roll of: ' + Math.max(first, second));
		}
		/***************** Roll with Disdvantage *****************/
		else if (content.startsWith('!rolldis')) {
			first = roll(content.substring(8))
			second = roll(content.substring(8))
			if (first === false)
				message.channel.send('syntax: ' + ROLL_MESSAGE);
			else
				message.channel.send(message.member.nickname + " rolled a " + first + " and " + second + 
										' for a lower roll of: ' + Math.min(first, second));
		}
		/***************** Roll Normally *****************/
		else if (content.startsWith('!roll')) {
			result = roll(content.substring(5))
			if (result === false)
				message.channel.send('syntax: ' + ROLL_MESSAGE);
			else 
				message.channel.send(message.member.nickname + " rolled an " + result);
		}
		else if (content.startsWith('!flip')) {
			result = rand(1, 2);
			if (result === 0)
				message.channel.send(message.member.nickname + ' got Heads!');
			else 
				message.channel.send(message.member.nickname + ' got Tails!');
		}
		else if (content.startsWith('!test') || content.startsWith('!bot')) {
			message.channel.send('Beep Boop. I\'m a bot.');
		}
	}
});

client.once('ready', () => {
	console.log('Ready!');
});

client.login(token);


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
 * @param {string} content Full message the bot received, already parsed and removed !roll
 */
function roll(content) {
	content = content.replace(/\s+/g, '');
	length = content.length;
	index = 0  // Will always look at the next character in content.
	if (length == index) // empty, so return default
		return rand();

	try {
		quantity = parseInt(content.substring(index))
		// Edge case to allow omission of quantity in [quantity]d[size]
		if (isNaN(quantity)) {
			quantity = 1;
			index += Math.floor(Math.log10(quantity)) + 1;
		}
		else {
			index += Math.floor(Math.log10(quantity)) + 2;
		}

		size = parseInt(content.substring(index));
		console.log('quantity: ' + quantity);
		console.log('size: ' + size);

		if (isNaN(size) || quantity < 1 || size < 1 || quantity > 100 || size > 100 ) return false;

		index += Math.floor(Math.log10(size)) + 1;

		if (length <= index) return rand(quantity, size); // No modifier, so return without one.
		
		if (content[index] === '-') subtraction = true;
		else if (content[index] === '+') subtraction = false;
		else return false;
		index += 1;
		
		modifier = parseInt(content.substring(index));
		console.log('index: ' + index + 'at: ' + content[index]);
		console.log('modifier: ' + modifier);

		if (subtraction) return rand(quantity, size, -1 * modifier);
		else return rand(quantity, size, modifier);
		
	} catch (e) {
		console.log(e)
		return false;
	}
}