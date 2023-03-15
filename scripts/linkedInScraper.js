require('dotenv').config()
console.log("env vars: ", process.env)

const { 
    LinkedinScraper,
    relevanceFilter,
    timeFilter,
    typeFilter,
    experienceLevelFilter,
    events,
} = require("linkedin-jobs-scraper");

//import fs from 'fs'
const fs = require('fs');

// Need some readfile stuff to get JSON out of .json file
const readFile = fs.readFile;

// Also need to write files
const writeFile = fs.writeFile;

// Tracking Var
let idCount = 0;
let oldData;

(async () => {
    // Each scraper instance is associated with one browser.
    // Concurrent queries will run on different pages within the same browser instance.
    const scraper = new LinkedinScraper({
        headless: true,
        slowMo: 200,
        args: [
            "--lang=en-US",
        ],
    });

    // Add listeners for scraper events
    scraper.on(events.scraper.data, (data) => {
        idCount++
        console.log(
            `JobNumber='${idCount}'`,
            data.description.length,
            data.descriptionHTML.length,
            `Query='${data.query}'`,
            `Location='${data.location}'`,
            `Id='${data.jobId}'`,
            `Title='${data.title}'`,
            `Company='${data.company ? data.company : "N/A"}'`,
            `Place='${data.place}'`,
            `Date='${data.date}'`,
            `Link='${data.link}'`,
            `applyLink='${data.applyLink ? data.applyLink : "N/A"}'`,
            `senorityLevel='${data.senorityLevel}'`,
            `function='${data.jobFunction}'`,
            `employmentType='${data.employmentType}'`,
            `industries='${data.industries}'`,
            `insights='${data.insights}'`,
        );
        let job = {
            JobNumber: idCount,
            Description_Length: data.description.length,
            Description_HTML_Length: data.descriptionHTML.length,
            Description: data.description,
            Query: data.query,
            Location: data.location,
            Id: data.jobId,
            Title: data.title,
            Company: `${data.company ? data.company : "N/A"}`,
            Place: data.place,
            Date: data.date,
            Link: data.link,
            applyLink: `${data.applyLink ? data.applyLink : "N/A"}`,
            senorityLevel: data.senorityLevel,
            function: data.jobFunction,
            employmentType: data.employmentType,
            industries: data.industries,
            insights: data.insights
        };

        let stringJob = JSON.stringify(job, null, 2);

        readFile('./jobs.json', 'utf-8', (err, fileContent) => {
            if (err) {
                // Just throwing the error because I'm too lazy to handle it
                console.log(err); 
                throw new Error(err);
            }
        
            // Store the filecontent as new var
            const results = fileContent;
        
            // // Convert from JSON string to JSON object (JSON.Parse also removes duplicate keys FYI)
            // const converted = JSON.parse(results)

            if (fileContent == undefined || fileContent.length == 0) {
                oldData = stringJob;
              } else {
                oldData = oldData + ",\n" + stringJob
              }
            
            let writeIt = "[\n" + oldData + "\n]";
            fs.writeFileSync('jobs.json', writeIt)
        })
    });

    scraper.on(events.scraper.error, (err) => {
        console.error(err);
    });

    scraper.on(events.scraper.end, () => {
        console.log('All done!');
    });

    // Add listeners for puppeteer browser events
    scraper.on(events.puppeteer.browser.targetcreated, () => {
    });
    scraper.on(events.puppeteer.browser.targetchanged, () => {
    });
    scraper.on(events.puppeteer.browser.targetdestroyed, () => {
    });
    scraper.on(events.puppeteer.browser.disconnected, () => {
    });

    // Custom function executed on browser side to extract job description
    const descriptionFn = () => document.querySelector(".description__text")
        .innerText
        .replace(/[\s\n\r]+/g, " ")
        .trim();

    // Run queries concurrently    
    await Promise.all([
        // Run queries serially
        scraper.run([
            {
                query: "Product Manager",
                options: {
                    locations: ["Canada"],
                    limit: 12000,
                    filters: {
                        relevance: relevanceFilter.RELEVANT,
                        time: timeFilter.MONTH,
                        type: [typeFilter.FULL_TIME, typeFilter.CONTRACT, typeFilter.PART_TIME, typeFilter.TEMPORARY],
                        experience: [experienceLevelFilter.INTERNSHIP, experienceLevelFilter.ENTRY_LEVEL, experienceLevelFilter.ASSOCIATE],   
                    },       
                }                                                       
            }//,
            // {
            //     query: "Product Owner",
            //     options: {
            //         locations: ["Canada"],
            //         limit: 12000,
            //         filters: {
            //             relevance: relevanceFilter.RELEVANT,
            //             time: timeFilter.MONTH,
            //             type: [typeFilter.FULL_TIME, typeFilter.CONTRACT, typeFilter.PART_TIME, typeFilter.TEMPORARY],
            //             experience: [experienceLevelFilter.INTERNSHIP, experienceLevelFilter.ENTRY_LEVEL, experienceLevelFilter.ASSOCIATE],   
            //         },       
            //     }     
            // },
            // {
            //     query: "Business Analyst",
            //     options: {
            //         locations: ["Canada"],
            //         limit: 12000,
            //         filters: {
            //             relevance: relevanceFilter.RELEVANT,
            //             time: timeFilter.MONTH,
            //             type: [typeFilter.FULL_TIME, typeFilter.CONTRACT, typeFilter.PART_TIME, typeFilter.TEMPORARY],
            //             experience: [experienceLevelFilter.INTERNSHIP, experienceLevelFilter.ENTRY_LEVEL, experienceLevelFilter.ASSOCIATE],   
            //         },       
            //     }     
            // }
        ], { // Global options, will be merged individually with each query options
            locations: ["Canada"],
            optimize: true,
            limit: 10000,
        }),
    ]);

    // Close browser
    await scraper.close();
})();