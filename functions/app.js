const snoowrap = require('snoowrap');
const { COTripUtil } = require('./utils/COTripUtil.js');
const fs = require('fs')


function getRouteDirectionString(route){
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
            break;
    }
}

function buildRedditMarkdown(incidents, destinations){
    let result = " > Last Updated: "+new Date().toLocaleString('en-US', { timeZone: 'America/Denver' })+" \n\n _Updated every 10 minutes. Data provided by CDOT / COTrip. Bot managed by u/pattyd14._ \n\n [Contribute to the Bot](https://github.com/patrickdundas/CoSkiTripDash) or [Request Updates](https://forms.gle/etYQsWx4NZkEZctm9) \n\n";
    result+=`# Travel Time \n`
    for(let route in destinations){
        result+=`## ${route} \n`
        for(let direction in destinations[route]){
            result+=`### ${direction} \n`
            for(let destination of destinations[route][direction]){
                result+=`#### ${destination.displayName} - ${destination.travelTime/60} mins \n`
            }
        }
    }
    
    
    result+=`# Incidents\n`
    for(let route in incidents){
        result+=`## ${route}\n`
        for(let subroute in incidents[route]){
            let displaySubroute = subroute;
            if(subroute === "both"){
                displaySubroute = "Both Directions"
            }
            else{
                displaySubroute = getRouteDirectionString(subroute)
            }
            result+=`### ${displaySubroute}\n`
            for(let incident of incidents[route][subroute]){
                incident = incident['properties']
                let lastUpdated = new Date(incident['lastUpdated']).toLocaleString('en-US', { timeZone: 'America/Denver' });
                console.log(incident)
                result += `#### ${incident['type']} / ${incident['category']}\n${incident['travelerInformationMessage']}\n\n_Updated: ${lastUpdated}_\n\n`
            }
        }
    }
    
    result+="\n&nbsp;\n&nbsp;\n&nbsp;\n&nbsp;\n\n\n_Data Disclaimer, Required By CDOT:_\n\n\n> The data made available here has been modified for use from its original source, which is the State of Colorado, Department of Transportation (CDOT).  THE STATE OF COLORADO AND CDOT MAKES NO REPRESENTATIONS OR WARRANTY AS TO THE COMPLETENESS, ACCURACY, TIMELINESS, OR CONTENT OF ANY DATA MADE AVAILABLE THROUGH THIS SITE. THE STATE OF COLORADO AND CDOT EXPRESSLY DISCLAIMS ALL WARRANTIES, WHETHER EXPRESS OR IMPLIED, INCLUDING ANY IMPLIED WARRANTIES OF MERCHANTABILITY, OR FITNESS FOR A PARTICULAR PURPOSE.  The data is subject to change as modifications and updates are complete. It is understood that the information contained in the Web feed is being used at one's own risk."
    return result;
}

async function main(){
    const coTrip = new COTripUtil();
    let incidents = await coTrip.getIncidents();
    let destinations = await coTrip.getDestinations();;

    const routeFilter = ["I-70"]
    /*
        Eventually contains an object with the structure:
        {
            'I-70': { 'I-70E': [ [Object], [Object], [Object] ], 'I-70W': [ [Object] ] }
        }
    */
    var filteredIncidents = {}

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
        console.log(incidentRoute, impactsBothDirections)
        // check all routeFilter routes against the current incidentRoute
        for(let route of routeFilter){
            if(incidentRoute.indexOf(route) !== -1){
                let displayRoute = incidentRoute;
                if(impactsBothDirections){
                    displayRoute = "both"
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

    const destinationFilter = {"OpenTMS-TravelTime556483":{"displayName":"Georgetown Chainup to Tunnel","route":"I-70W"},"OpenTMS-TravelTime548989":{"displayName":"Silverthorne Chainup to Tunnel","route":"I-70E"}}
    let filteredDestinations = {}

    for(let destination of destinations){
        for (let filter in destinationFilter){
            if(destination['properties']['id'] === filter){
                console.log(destination['properties'])
                let route = destinationFilter[filter]["route"].slice(0, destinationFilter[filter]["route"].length-1) // cut off direction (N,E,S,W)
                if(!Object.keys(filteredDestinations).includes(route)){
                    filteredDestinations[route] = {}
                }

                let direction = getRouteDirectionString(destinationFilter[filter]["route"])
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

    const markdown = buildRedditMarkdown(filteredIncidents, filteredDestinations);

    if(process.env.REDDIT_POST_ID !== undefined){
        console.log("reddit")
        const reddit = new snoowrap({
            userAgent: process.env.REDDIT_USER_AGENT,
            clientId: process.env.REDDIT_CLIENT_ID,
            clientSecret: process.env.REDDIT_CLIENT_SECRET,
            refreshToken: process.env.REDDIT_REFRESH_TOKEN
        });
        await reddit.getSubmission(process.env.REDDIT_POST_ID).edit(markdown)
        console.log("Request sent to reddit")
    }
    else{
        console.log("local")

        fs.writeFile("./output.md", markdown, ()=>{
            console.log("Markdown output is being saved locally")
        });
    }
}

module.exports = {main}