//Scraper for https://www.transfermarkt.com

var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
const Json2csvParser = require('json2csv').Parser;

const fields = [{
    label: 'Player',
    value: 'player'
  },{
    label: 'Source',
    value: 'from'
  },{
    label: 'Target',
    value: 'to'
  },{
    label: 'Value',
    value: 'value'
}];

var transfers = [];
const parser = new Json2csvParser({ fields });
var fileName = "Transfers_1718.csv";

var options = {
        headers: {
               'User-Agent': 'Mozilla/5.0'
        }
}

var urls = [
    // 17-18 Top5+PT
    'https://www.transfermarkt.com/premier-league/transfers/wettbewerb/GB1/saison_id/2017',
    'https://www.transfermarkt.com/la-liga/transfers/wettbewerb/ES1/saison_id/2017',
    'https://www.transfermarkt.com/serie-a/transfers/wettbewerb/IT1/saison_id/2017',
    'https://www.transfermarkt.com/1-bundesliga/transfers/wettbewerb/L1/saison_id/2017',
    'https://www.transfermarkt.com/ligue-1/transfers/wettbewerb/FR1/saison_id/2017',
    'https://www.transfermarkt.com/primeira-liga/transfers/wettbewerb/PO1/saison_id/2017'
]

function isMainClub(club) {
    
    var splited = club.split(" ");

    if (club.indexOf("Juveni") > -1 || splited.indexOf("U17") > -1 || 
        splited.indexOf("U18") > -1 || splited.indexOf("U19") > -1 ||
        splited.indexOf("U21") > -1 || splited.indexOf("U23") > -1 ||
        splited.indexOf("Primavera") > -1 || splited.indexOf("B") > -1  ||
        splited[splited.length-1].indexOf("II") > -1)
            return false;

    return true;

}

function parseValue(value) {

    if(value === "gratuito" || value === "Free transfer" || value === "-")
        return "0";
    else if(value === "Swap deal")
        return "Swap";
    else if(value.indexOf("End of loan") > -1)
        return "Loan End";
    else if(value === "Loan")
        return "Loan fee:0";

    var splited = value.split(" ");

    if(splited.indexOf("Th.") > -1){

        if(value.indexOf("fee") > -1)
            return splited[0] + " " + splited[1] + "000";

        return splited[0] + "000";

    }

    if(splited.indexOf("Mill.") > -1){

        if(value.indexOf("fee") > -1){
            var splitedSplited = splited[1].split(":");
            var splitedMillions = splitedSplited[1].split(",");
            return splited[0] + " " + splitedSplited[0] + ":" + splitedMillions[0] + splitedMillions[1] + "0000";
        }

        var splitedMillions = splited[0].split(",");
        return splitedMillions[0] + splitedMillions[1] + "0000";

    }

    return value;
}

function isMoneyTransfer(value) {

        var splited = value.toString().split(" ");

        if(value.toString().indexOf("fee") < 0){
            if(splited.indexOf("Th.") > -1)
                return splited[0] + "000";
            else if(splited.indexOf("Mill.") > -1){
                var splitedMillions = splited[0].split(",");
                return splitedMillions[0] + splitedMillions[1] + "0000";
            }
        }
        
        return false;
}

function scrap(body) {

    var $ = cheerio.load(body);

    $('.large-8.columns .box').each(function(i, elem){
            
        if(i>2) {

            var data = $(this);
                
            var club = data.children('.table-header').text();
            var transfersIN = data.children('.responsive-table').first().children('table').children('tbody').children('tr');
            var transfersOUT = data.children('.responsive-table').last().children('table').children('tbody').children('tr');
    
            transfersIN.each(function(i, elem) {

                var fromClub = $(this).find('.no-border-rechts.zentriert').children('a').children('img').attr('alt');

                //avoid non main team
                if(!isMainClub(fromClub))
                    return;
                
                var value = parseValue($(this).find('.rechts').children('a').text());

                //only transfers involving money
                /*var value = isMoneyTransfer($(this).find('.rechts').children('a').text());
                if(value === false)
                    return;*/

                var transfer = new Object();

                transfer.player = $(this).find('.di.nowrap').first().text();
                transfer.from = fromClub;
                transfer.to = club;
                transfer.value = value;

                //avoid duplicates
                if (transfers.filter(transf => transf.player === transfer.player && transf.from === transfer.from).length == 0)
                    transfers.push(transfer);                   

            });

            transfersOUT.each(function(i, elem) {

                var toClub = $(this).find('.no-border-rechts.zentriert').children('a').children('img').attr('alt');

                //avoid non main team
                if(!isMainClub(toClub))
                    return;
                
                var value = parseValue($(this).find('.rechts').children('a').text());    

                //only transfers involving money
                /*var value = isMoneyTransfer($(this).find('.rechts').children('a').text());
                if(value === false)
                    return;*/

                var transfer = new Object();

                transfer.player = $(this).find('.di.nowrap').first().text();
                transfer.from = club;
                transfer.to =  toClub;
                transfer.value = value;
                
                //avoid duplicates
                if (transfers.filter(transf => transf.player === transfer.player && transf.from === transfer.from).length == 0)
                    transfers.push(transfer); 
                    
            });   
        }
    })
}

function convertToCSV() {
    
    try {
        const csv = parser.parse(transfers);

        fs.writeFile("../data/" + fileName, csv, "utf8", function (err, stat) {
            if (err) throw err;
        });

    } catch (err) {
        console.error(err);
    }

}

function callback(error, response, body) {
    if(!error && response.statusCode == 200){
        scrap(body);
        convertToCSV();
    }
}

function makeRequests() {
    urls.forEach(u => {
        request(u, options, callback);
    });
}

makeRequests();