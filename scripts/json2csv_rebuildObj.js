// Import csv-writer
const csvwriter = require('csv-writer');

//import fs from 'fs'
const fs = require('fs');

// Need some readfile stuff to get JSON out of .json file
const readFile = fs.readFile;

// Initalize csvWriter so we can write to a csv
var createCsvWriter = csvwriter.createObjectCsvWriter

// Read the JSON file, games.json in this case and in the same folder.
readFile('./jobs.json', 'utf-8', (err, fileContent) => {
    if (err) {
        // Just throwing the error because I'm too lazy to handle it
        console.log(err); 
        throw new Error(err);
    }
  
    // Passing the column names intp the module
    const csvWriter = createCsvWriter({
        // Output csv file name is agg_game_data.csv
        path: 'jobs.csv',
        header: [
                // Title of the columns (column_names)
                {id: 'Id', title: 'Id'},
                {id: 'Description_Length', title: 'Description_Length'},
                {id: 'Description_HTML_Length', title: 'Description_HTML_Length'},
                {id: 'Description', title: 'Description'},
                {id: 'Query', title: 'Query'},
                {id: 'Location', title: 'Location'},
                {id: 'Title', title: 'Title'},
                {id: 'Company', title: 'Company'},
                {id: 'Place', title: 'Place'},
                {id: 'Date', title: 'Date'},
                {id: 'Link', title: 'Link'},
                {id: 'applyLink', title: 'applyLink'},
                {id: 'senorityLevel', title: 'senorityLevel'},
                {id: 'function', title: 'function'},
                {id: 'employmentType', title: 'employmentType'},
                {id: 'industries', title: 'industries'},
                {id: 'insights', title: 'insights'}
            ]
        });
  
    // Get the values for each column through an array
    // Store the filecontent as new var
    const results = fileContent;
    // Convert from JSON string to JSON object (JSON.Parse also removes duplicate keys FYI)
    const converted = JSON.parse(results)

    // Now we need to iterate through the converted array and rebuild a list of objects that matches what we need.
    let fixedArray = []
    converted.forEach(element => {
        //Create an object in the format we need
        let newObj = {
            Id: 0,
            Description_Length: 0,
            Description_HTML_Length: 0,
            Description: "",
            Query: "",
            Location: "",
            Title: "",
            Company: "",
            Place: "",
            Date: "",
            Link: "",
            applyLink: "",
            senorityLevel: "",
            function: "",
            employmentType: "",
            industries: "",
            insights: ""
        }
        // Take the attribs from the elements and assign the new object
        newObj.Id = Number.parseInt(element.Id);
        newObj.Description_Length = element.Description_Length;
        newObj.Description_HTML_Length = element.Description_HTML_Length;
        newObj.Description = element.Description;
        newObj.Query = element.Query;
        newObj.Location = element.Location;
        newObj.Title = element.Title;
        newObj.Company = element.Company;
        newObj.Place = element.Place;
        newObj.Date = element.Date;
        newObj.Link = element.Link;
        newObj.applyLink = element.applyLink;
        newObj.senorityLevel = element.senorityLevel;
        newObj.function = element.function;
        newObj.employmentType = element.employmentType;
        newObj.industries = element.industries;

        // We need to loop through this to concatenate the tags
        let insights = "";
        element.insights.forEach(element => {
            insights = insights + "; " + element
        });
        
        newObj.insights = insights;

        fixedArray.push(newObj);
    });


    // Now we can write to a csv using the Writerecords function
    csvWriter
    .writeRecords(fixedArray)
    .then(()=> console.log('Data uploaded into csv successfully')); 
    })