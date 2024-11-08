class COTripUtil {
    constructor(){
        this.incidents = []
        this.destinations = []
        this.unstableScrapedData = []
        this.apiKey = process.env.COTRIP_API_KEY
        this.baseUrl = "https://data.cotrip.org/api/v1"

        if(this.apiKey === undefined || this.apiKey === null){
            console.error("Please specify COTRIP_API_KEY")
        }
    }

    // Gets incident data from the official COTrip API - CODOT
    getIncidents(){
        return new Promise((resolve, reject)=>{
            const options = {method: 'GET'};
            const url = this.baseUrl+'/incidents?apiKey='+this.apiKey;
            fetch(url, options)
                .then(response => response.json())
                .then(response => {
                    this.incidents = response['features'];
                    resolve(response['features']);
                })
                .catch(err => console.error(err));
        }) 
    }

    // Gets incident data from the official COTrip API - CODOT
    getDestinations(){
        return new Promise((resolve, reject)=>{
            const options = {method: 'GET'};
            const url = this.baseUrl+'/destinations?apiKey='+this.apiKey;
            fetch(url, options)
                .then(response => response.json())
                .then(response => {
                    this.destinations = response['features'];
                    resolve(response['features']);
                })
                .catch(err => console.error(err));
        }) 
    }
}

module.exports = {COTripUtil};