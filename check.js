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
const page = new Array();
var browser;

//Main async function
(async function main() {
    try{
        //---------------
        browser = await puppeteer.launch({headless: false});
        
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
        var paraCount = 5;
        var curr = 0;
        for(var x = 0; x < 5;x++){
            if (curr < paraCount) {
                gather(x, csvData[x]);   
            }
            else{
                x--;
                continue;
            }
            
        }

        //loop gather()

        //end
        //console.log("All done!");
        //browser.close();
    }
    catch(err){
        console.log("!!!! >>>>>  my error",err);
    }

    async function gather(index, item){
        //console.log("inside gather: " + paraNo +" : "+paraStart+" : "+length);
        page[index] = await browser.newPage();
        curr++;
        page[index].setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.77 Safari/537.36');
     
            //var startT = new Date();
            await page[index].goto("https://www.amazon.com/gp/offer-listing/"+item, {waitUntil: 'load', timeout: 0}); //bypass timeout
            await page[index].waitForSelector('body');
            var title = "";

            if (await page[index].$('#olpProductDetails > h1') !== null){
                title = await page[index].evaluate(() => document.querySelector('#olpProductDetails > h1').innerText); 
            }
            else{
                title = "Missing Detail page";
            }
            let row = {
                    'Style':item,
                    'Title':title
                }
            exportToCSV.write(objToString(row) + '\n','utf-8');
            console.log(objToString(row)); 
            page[index].close();
            curr--;
            //var endT = new Date() - startT;
            //console.log("Execution time: "+endT + "ms" + '\n');
            //ETC(endT, csvData.length-i-1);
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





    

