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
var exportToCSV = fs.createWriteStream('result3.txt');
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
        //const browser = await puppeteer.launch({headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox']});
        const browser = await puppeteer.launch({executablePath: 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
            headless: false});
        const page = await browser.newPage();
        page.setUserAgent('Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.98 Safari/537.36');
        const maxPageLimit = 9;
        var totalPageCounts = csvData.length;
        var curPageCount = 0;
        const links = new Array;
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

        //gather all the links
        for(var i = 0; i < csvData.length; i++){
            links[i] = "https://www.amazon.com/gp/offer-listing/"+csvData[i];
        }//----
        
        //async all links
        await Promise.all(links.map(async(link) =>{
            var title = "Missing Detail Page";
            try{
                const curPage = await browser.newPage();
                await curPage.goto(link);
                curPageCount++;
                console.log("opening tab.. "+curPageCount); 
                await curPage.waitForSelector('body');
                if (await curPage.$('#olpProductDetails > h1') !== null){
                    title = await curPage.evaluate(() => document.querySelector('#olpProductDetails > h1').innerText); 
                }
                console.log(link+ " = " +title);
                curPage.close();
                curPageCount--;
                console.log(curPageCount); 
            }
            catch(err){
                //console.log(link + "> Promise ER: "+err);
                //title = "Missing Detail Page!";
                console.log(link+ " = " +title);
                curPage.close();
                curPageCount--;
                console.log(curPageCount); 
            }
            
        }));//-----------


        /*
        while(totalPageCounts > 0)
        {
            const curPage =await browser.newPage();
            
            curPageCount++;
            console.log(curPageCount+ " = " +csvData[totalPageCounts]);

            if (curPageCount == 7) {
                await Promise.all(); 
            }
        }
        */


        /*for(var i = 0; i < csvData.length; i++){
        //for(const i of csvData){
            const curPageCount = 0;
            const curPage =await browser.newPage();
            await curPage.goto("https://www.amazon.com/gp/offer-listing/"+csvData[i]);
            //curPageCount++;
            
            //await pageArray[i].waitForSelector('body');
            console.log(csvData[i]);       
        }*/

        /*code starts here
        for(var i = 0; i < csvData.length; i++){
            var startT = new Date();//for ETC
            await page.goto("https://www.amazon.com/gp/offer-listing/"+csvData[i], {waitUntil: 'load', timeout: 0}); //bypass timeout
            await page.waitForSelector('body');
            var title = "";

            if (await page.$('#olpProductDetails > h1') !== null){
                title = await page.evaluate(() => document.querySelector('#olpProductDetails > h1').innerText); 
            }
            else{
                title = "Missing Detail page";
            }
            let row = {
                    'ASIN':csvData[i],
                    'Title':title
                }
            exportToCSV.write(objToString(row) + '\n','utf-8');
            console.log("No. "+i+ " ");
            console.log(objToString(row)); 
            var endT = new Date() - startT; //for ETC
            ETC(endT, csvData.length-i-1);
            await delay(750);
        }*/
        //end
 
        console.log("All done!");
        //browser.close();
    }
    catch(err){
        console.log("!!!! >>>>>  my error",err);
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

    function delay(time) {
       return new Promise(function(resolve) { 
           setTimeout(resolve, time)
       });
    }
})();





    
