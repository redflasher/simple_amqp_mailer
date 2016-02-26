var nodemailer = require('nodemailer');
var transport = nodemailer.createTransport("SMTP",{});
var amqp = require('amqp');

var connection = amqp.createConnection({ host: 'localhost'},
  { defaultExchangeName: 'timeback_exchange1' });

// po for connection to become established.
connection.on('ready', function()
{
  connection.exchange('exchange1', {type: 'fanout'},function(exchange)
  {
    connection.queue('queue1', function(q) {
        q.bind(exchange, "*");
        q.subscribe(function(message)
        {
          try
          {
            var infoInStr = message.data.toString();
            var msgObj = JSON.parse(infoInStr);

            console.log(msgObj.email+' '+msgObj.verstring);

            // здесь получение e-mail из очереди задач и его отправка пользователю
            var htmlMsg ="<p>Для завершения регистрации пройдите по ссылке: "+
            "<a href='http://timeback.tv/checkemail/"+msgObj.verstring+"'>"+
            "http://timeback.tv/checkemail/"+msgObj.verstring+"</a></p>";
            transport.sendMail(
            {
              from:"noreply@timeback.tv",
              to:msgObj.email,
              html:htmlMsg,
              subject:"Регистрация аккаунта TimeBack.TV"
            });
          }
          catch(e)
          {
            console.log('error in sendMail block: '+e);
          }
        });
      });
  });