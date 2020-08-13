const Webex = require(`webex`);
var moment = require('moment-timezone');
const Airtable = require('airtable')


function updateStatus(recordId){

  Airtable.configure({
    apiKey: "keyoPw1vi0AN2TbIP"
  })
  const base = Airtable.base("appg6ovHFMJF0lH6O")
  const table = base("HOLIDAYS")

  table.update(recordId, {
    "STATUS" : "SENT"
  }, (err, record) => {
    if (err) {
    console.error(err)
    return
    }
  })
}

function sendMessage(recordId){
  var webex = Webex.init({
    credentials: {
      access_token: process.env.botId
    }
  });

  webex.messages.create({
      markdown: process.env.responseText,
      roomId: process.env.roomId
  }).then(function(response){
    updateStatus(recordId)
  }) 
}


exports.handler = function(event, context, callback){

Airtable.configure({
  apiKey: "keyoPw1vi0AN2TbIP"
})

const base = Airtable.base("appg6ovHFMJF0lH6O")
const table = base("HOLIDAYS")
  

let records = []

// called for every page of records
const processPage = (partialRecords, fetchNextPage) => {
  records = [...records, ...partialRecords]
  fetchNextPage()
}

const processRecords = (err) => {
    if (err) {
      console.error(err)
      return
    }

  //process the `records` array
  records.forEach(function(record){

    var now = moment().tz(process.env.timezone)

    var sendDate = moment.tz(record.get("DAY")+" , 0:00:00 am","MMMM Do YYYY, h:mm:ss a", process.env.timezone);
    sendDate = sendDate.subtract(1, 'days').format('MMMM Do YYYY, ')+" 6:00:00 pm";
    sendDate=moment.tz(sendDate,"MMMM Do YYYY, h:mm:ss a", process.env.timezone)

        if(now>sendDate){
            sendMessage(record.getId());            
        }
  })
}

table.select({
    view: "Grid view",
    filterByFormula: '{STATUS} = "NOT SENT"'
  }).eachPage(processPage, processRecords)

    const response = {
        statusCode: 200,
        body: "",
    };

callback(null,200)
}

