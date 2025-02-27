// parsers/cybershokeParser.js
import axios from 'axios';
import cheerio from 'cheerio';

export const fetchServers = async () => {
    try {
        const { data } = await axios.get('https://cybershoke.net/ru/cs2/servers/hsdm');
        const $ = cheerio.load(data);
        const servers = [];

        $('.server-item').each((i, elem) => {
            const name = $(elem).find('.server-name').text().trim();
            const ping = $(elem).find('.server-ping').text().trim();
            const players = $(elem).find('.server-players').text().trim();
            const location = $(elem).find('.server-location').text().trim();

            servers.push({
                name,
                ping,
                players,
                location,
            });
        });

        // Возвращаем случайные 4 сервера
        return servers.sort(() => 0.5 - Math.random()).slice(0, 4);
    } catch (error) {
        console.error('Error fetching servers:', error);
        return [];
    }
};