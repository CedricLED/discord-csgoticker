const Discord = require('discord.js');
const client = new Discord.Client();
const config = require('./config.js');
const mysql = require('mysql2');

// create the connection to database
const connection = mysql.createConnection({
  host: config.host,
  user: config.user,
  database: config.database,
  password: config.password
});
var messageUpdater = false;
var ipUpdater = false;

client.on("ready", () => {
  console.log(`ready!`);
  let channel = client.channels.get(config.channel);
  var interval = setInterval(function() {
      // simple query
      connection.query(
        'SELECT ip, players, maxplayers, short_hostname FROM ' + config.table,
        function(err, results, fields) {
          let index = 0;
          let serverCount = [];
          results.forEach(serverInfo => {
            index++;
            let data = {
              name: serverInfo.short_hostname,
              ip: serverInfo.ip,
              players: serverInfo.players,
              maxplayers: serverInfo.maxplayers,
              short_hostname: serverInfo.short_hostname,
            };
            serverCount.push(JSON.stringify(data));
            if (index == results.length) {
              let index = 0;
              let description;
              let ip;
              serverCount.forEach((server) => {
                server = JSON.parse(server);
                index++;
                if (description && ip) {
                  description += `\n${server.name} | Players Online: [${server.players}/${server.maxplayers}]`;
                  ip += `\n${server.name} IP: ${server.ip}`;
                } else {
                  description = `${server.name} | Players Online: [${server.players}/${server.maxplayers}]`;
                  ip = `${server.name} IP: ${server.ip}`;
                }
                if (index == serverCount.length) {
                  console.log(timestamp() + " Sending Message");
                  if (messageUpdater) {
                    messageUpdater.edit({
                      embed: {
                        description: description
                      }
                    });
                    ipUpdater.edit({
                      embed: {
                        description: ip
                      }
                    });
                  } else {
                    channel.send({
                      embed: {
                        description: ip
                      }
                    }).then(msg => {
                      ipUpdater = msg;
                    });
                    channel.send({
                      embed: {
                        description: description
                      }
                    }).then(msg => {
                      messageUpdater = msg;
                    });
                  }
                }
              });
            }
          });
        });
    },
    config.refreshRate);
});

client.login(config.token);
