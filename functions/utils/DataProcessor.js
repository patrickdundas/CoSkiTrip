const snoowrap = require('snoowrap');
const fs = require('fs');

class DataProcessor {
    constructor(){
        /*
            Eventually this.incidents contains an object with the structure:
            {
                'I-70': { 'Eastbound': [ [Object], [Object], [Object] ], 'Westbound': [ [Object] ] }
            }
        */
        this.incidents = {};

        this.destinations = {};
        this.markdown = "";
        this.markdownTemplate = fs.readFileSync("./templates/reddit.md", "utf8");
        this.filters = {
            routes: ["I-70"],
            destinations: {"OpenTMS-TravelTime556483":{"displayName":"Georgetown Chainup to Tunnel","route":"I-70W"},"OpenTMS-TravelTime548989":{"displayName":"Silverthorne Chainup to Tunnel","route":"I-70E"}}
        }
    }

    convertRouteDirectionToString(route){
        let direction = route.slice(route.length-1,route.length).toUpperCase()
        switch (direction) {
            case "S":
                return "Southbound"
            case "N":
                return "Northbound"
            case "E":
                return "Eastbound"
            case "W":
                return "Westbound"
            default:
                return null
        }
    }

    importDestinations(destinations){
        let filteredDestinations = this.destinations;

        let destinationFilter = this.filters["destinations"];

        for(let destination of destinations){
            for (let filter in destinationFilter){
                if(destination['properties']['id'] === filter){
                    let route = destinationFilter[filter]["route"].slice(0, destinationFilter[filter]["route"].length-1) // cut off direction (N,E,S,W)
                    if(!Object.keys(filteredDestinations).includes(route)){
                        filteredDestinations[route] = {}
                    }
    
                    let direction = this.convertRouteDirectionToString(destinationFilter[filter]["route"])
                    if(!Object.keys(filteredDestinations[route]).includes(direction)){
                        filteredDestinations[route][direction] = []
                    }
    
                    filteredDestinations[route][direction].push({
                        displayName: destinationFilter[filter].displayName,
                        travelTime: destination['properties']['travelTime']
                    })
                }
            }
        }
    }

    importIncidents(incidents){
        let filteredIncidents = this.incidents;

        let routeFilter = this.filters["routes"];
        // iterate through all current incidents and filter down to incidentRoutes
        for(let incident of incidents){
            // extract info from the incident
            let incidentRoute = incident['properties']['routeName'].toUpperCase();

            let impactsBothDirections = false;

            // Detect if the incident impacts both directions of travel (array incident['properties']['additionalImpacts'] contains a string "Impacts both directions")
            if(Object.keys(incident['properties']).includes("additionalImpacts")){
                for(let impact of incident['properties']['additionalImpacts']){
                    if(impact.toUpperCase() === "IMPACTS BOTH DIRECTIONS"){
                        impactsBothDirections = true;
                        break;
                    }
                }
            }
            // check all routeFilter routes against the current incidentRoute
            for(let route of routeFilter){
                if(incidentRoute.indexOf(route) !== -1){

                    let displayRoute;
                    if(impactsBothDirections){
                        displayRoute = "Both Directions"
                    }
                    else{
                        displayRoute = this.convertRouteDirectionToString(incidentRoute);
                    }                    

                    if(!Object.keys(filteredIncidents).includes(route)){
                        filteredIncidents[route] = {}
                    }

                    if(!Object.keys(filteredIncidents[route]).includes(displayRoute)){
                        filteredIncidents[route][displayRoute] = []
                    }

                    filteredIncidents[route][displayRoute].push(incident);
                    break;
                }
            }
        }
    }


    // build markdown by modifying contents of templates/reddit.md
    buildMarkdown(){
        const incidents = this.incidents;
        const destinations = this.destinations;

        let result = this.markdownTemplate;

        result = result.replace("{{timestamp}}", new Date().toLocaleString('en-US', { timeZone: 'America/Denver' }));
        
        let destinationString = "";

        for(let route in destinations){
            destinationString+=`## ${route} \n`
            for(let direction in destinations[route]){
                destinationString+=`### ${direction} \n`
                for(let destination of destinations[route][direction]){
                    destinationString+=`#### ${destination.displayName} - ${destination.travelTime/60} mins \n`
                }
            }
        }

        result = result.replace("{{destinations}}", destinationString);
        
        let incidentString = "";
        for(let route in incidents){
            incidentString+=`## ${route}\n`
            for(let subroute in incidents[route]){
                incidentString+=`### ${subroute}\n`
                for(let incident of incidents[route][subroute]){
                    incident = incident['properties']
                    let lastUpdated = new Date(incident['lastUpdated']).toLocaleString('en-US', { timeZone: 'America/Denver' });
                    incidentString += `#### ${incident['type']} / ${incident['category']}\n${incident['travelerInformationMessage']}\n\n_Updated: ${lastUpdated}_\n\n`
                }
            }
        }

        result = result.replace("{{incidents}}", incidentString);
                
        this.markdown = result;
    }

    // Sends to reddit if enabled, or saves locally if dev
    save(){

        // In production / cloud environment, the reddit post will be updated here
        if(process.env.REDDIT_POST_ID !== undefined){
            console.log("Sending to reddit")
            const reddit = new snoowrap({
                userAgent: process.env.REDDIT_USER_AGENT,
                clientId: process.env.REDDIT_CLIENT_ID,
                clientSecret: process.env.REDDIT_CLIENT_SECRET,
                refreshToken: process.env.REDDIT_REFRESH_TOKEN
            });
            reddit.getSubmission(process.env.REDDIT_POST_ID).edit(this.markdown).then(()=>{
                console.log("Request sent to reddit")
            })
        }
    
        // Local development: create output.md
        else{
            console.log("Saving locally")
    
            fs.writeFile("./output.md", this.markdown, ()=>{
                console.log("Markdown output saved")
            });
        }
    }
}

module.exports = {DataProcessor}