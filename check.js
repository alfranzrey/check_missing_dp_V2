//set constant variables
const puppeteer = require('puppeteer');
const vo = require('vo');
const fs = require('fs');
const parse = require('csv-parse');
    
//get csv data first
var csvData=[];
fs.createReadStream('asins.csv')
    .pipe(parse({delimiter: ':'}))
    .on('data', function(csvrow) {
        csvData.push(csvrow);        
    })
    .on('end',function() {
    });
//-----------------------
//-export file result
var exportToCSV = fs.createWriteStream('result.txt');
var header ='ASIN'  + '\t' +
            'Title'    + '\n';
console.log(header);
exportToCSV.write(header);
function objToString (obj) {
    var str = '';
    for (var p in obj) {
        if (obj.hasOwnProperty(p)) {
           str += obj[p] + '\t';
        }
    }
    return str;
}
//-------------------------


//Main async function
(async function main() {
    try{
        //---------------
        const browser = await puppeteer.launch({headless: false});
        
        /*block images and css
            await page.setRequestInterception(true);
            page.on('request', (req) => {
                if(req.resourceType() == 'stylesheet' || req.resourceType() == 'font' || req.resourceType() == 'image'){
                    req.abort();
                }
                else {
                    req.continue();
                }
            });
            */
        //-----------------

        //code starts here
        var paraCount = 2;
        const page = new Array();
        for(var x = 0; x < paraCount;x++){
            page[x] = await browser.newPage();
            page[x].setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.77 Safari/537.36');
            gather(x, 0, csvData.length);
        }

        //loop gather()

        //end
        console.log("All done!");
        //browser.close();
    }
    catch(err){
        console.log("!!!! >>>>>  my error",err);
    }

    async function gather(paraNo, paraStart, lenght){
        //console.log("inside gather: " + paraNo +" : "+paraStart+" : "+lenght);
        for(var i = paraStart; i < lenght; i++){
            var startT = new Date();
            await page[paraNo].goto("https://www.amazon.com/gp/offer-listing/"+csvData[i], {waitUntil: 'load', timeout: 0}); //bypass timeout
            await page[paraNo].waitForSelector('body');
            var title = "";

            if (await page[paraNo].$('#olpProductDetails > h1') !== null){
                title = await page[paraNo].evaluate(() => document.querySelector('#olpProductDetails > h1').innerText); 
            }
            else{
                title = "Missing Detail page";
            }
            let row = {
                    'Style':csvData[i],
                    'Title':title
                }
            exportToCSV.write(objToString(row) + '\n','utf-8');
            console.log(objToString(row)); 
            var endT = new Date() - startT;
            //console.log("Execution time: "+endT + "ms" + '\n');
            ETC(endT, csvData.length-i-1);
            }
        }

    function ETC(durationPerLoop, loopsRemaining){
        var etc = durationPerLoop * loopsRemaining;
        var secs = (etc / 1000).toFixed(2);
        var mins = (secs / 60).toFixed(2);
        var hours = (mins / 60).toFixed(2);
        var final_etc = "";
        if (hours >= 1) {
            final_etc = hours + " hour(s)";
        }
        if (hours < 1) {
            final_etc = mins + " min(s)";
        }
        if (mins < 1) {
            final_etc = secs + " sec(s)";
        }
        return console.log("ETC: "+final_etc+'\n');
    }

})();





    

