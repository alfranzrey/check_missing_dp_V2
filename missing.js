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
        //const browser = await puppeteer.launch({headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox']});
        const browser = await puppeteer.launch({executablePath: 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
            headless: false});
        const page = await browser.newPage();
        page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.98 Safari/537.36');    
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

        //-testing
        /*
        var subLinks = [[]];
        var tempLinks = ["0","0"];
        subLinks[0][0]="a";
        subLinks[0][1]="b";
        tempLinks[0]="c";
        tempLinks[1]="d";
        subLinks.push(tempLinks);
        console.log(subLinks);
        console.log(subLinks[1][0]);
        */

        //
        //-------------gather all the links
        var maxTabCount = 9;
        var curPageCount = 0;
        var iteration = -1;
        var subLinkCount = 0;
        var subLinks = []; //all links
        var tempLinks = [];
        //populate all sublinks
        for(var i = 0; i < csvData.length; i++){
            iteration++;
            if(iteration == maxTabCount){
                subLinks.push(tempLinks);
                subLinkCount++;
                iteration = 0; 
                tempLinks = [];                  
            }
            tempLinks[iteration]="https://www.amazon.com/gp/offer-listing/"+csvData[i]; //display what is added
            if(i+1 == csvData.length){
                subLinks.push(tempLinks);   
            }
        }
        console.log(subLinks);
        console.log(subLinks[2][0]);
        //--------------------
  
        //--------display in mutiple tabs by batch
        /*
        for(var x = 0; x <= subLinkCount; x++){
            await Promise.all(subLinks[x].map(async(link) =>{
                var title = "Missing Detail Page";
                var currentASIN = link.slice(40,50);
                try{
                    const curPage = await browser.newPage();
                    await curPage.goto(link);
                    curPageCount++;
                    //console.log("opening tab.. "+curPageCount); 
                    //-code starts here
                    await curPage.waitForSelector('body');
                    if (await curPage.$('#olpProductDetails > h1') !== null){
                        title = await curPage.evaluate(() => document.querySelector('#olpProductDetails > h1').innerText); 
                    }
                    console.log(currentASIN+": "+title);
                    curPage.close();
                    curPageCount--;
                    //console.log(curPageCount); 
                }
                catch(err){
                    //console.log(link + "> Promise ER: "+err);
                    //title = "Missing Detail Page!";
                    console.log(currentASIN+": "+title);
                    curPage.close();
                    curPageCount--;
                    console.log(curPageCount); 
                }
            
            }));//end promise      
        }//end for
        */
        //--------------------------

 
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





    
