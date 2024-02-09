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
        else{
            console.log(this.apiKey)
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

    // UNSTABLE - Scrapes information from the COTrip map webpage graphql endpoint
    getScrapedWebData(){
        return new Promise((resolve, reject)=>{
            const options = {
                method: 'POST',
                headers: {
                  authority: 'maps.cotrip.org',
                  accept: '*/*',
                  'accept-language': 'en-US,en;q=0.9',
                  'cache-control': 'no-cache',
                  'content-type': 'application/json',
                  origin: 'https://maps.cotrip.org',
                  pragma: 'no-cache',
                  referer: 'https://maps.cotrip.org/event/COSEG-320394/@-108.60751,38.9646,8?show=winterDriving,roadReports,plowLocations,weatherRadar,weatherWarnings,chainLaws',
                  'sec-ch-ua': '"Not A(Brand";v="99", "Google Chrome";v="121", "Chromium";v="121"',
                  'sec-ch-ua-mobile': '?0',
                  'sec-ch-ua-platform': '"Windows"',
                  'sec-fetch-dest': 'empty',
                  'sec-fetch-mode': 'cors',
                  'sec-fetch-site': 'same-origin',
                  'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36'
                },
                body: '[{"query":"query MapFeatures($input: MapFeaturesArgs!, $plowType: String) { mapFeaturesQuery(input: $input) { mapFeatures { bbox tooltip uri features { id geometry properties } ... on Event { priority } __typename ... on Camera { views(limit: 5) { uri ... on CameraView { url } category } } ... on Plow { views(limit: 5, plowType: $plowType) { uri ... on PlowCameraView { url } category } } } error { message type } } }","variables":{"input":{"north":41.64301,"south":36.03895,"east":-104.33657,"west":-110.24173,"zoom":8,"layerSlugs":["winterDriving","roadReports","plowLocations","weatherRadar","weatherWarnings","chainLaws"],"nonClusterableUris":["event/COSEG-320394"]},"plowType":"plowCameras"}},{"query":"query Event( $layerSlugs: [String!]! $eventId: ID! $nearbyViewLimit: Int! $isCamerasEnabled: Boolean! $showCameraLastUpdated: Boolean! $showCommercialQuantities: Boolean! ) { eventQuery(eventId: $eventId, layerSlugs: $layerSlugs) { event { uri title description bbox location { primaryLinearReference secondaryLinearReference } icon color lastUpdated { timestamp timezone } beginTime { timestamp timezone } isWazeEvent priority agencyAttribution { agencyName agencyURL agencyIconURL } quantities @include(if: $showCommercialQuantities) { label value icon } feedbackOptions { id total prompt icon color lastUpdated { timestamp timezone } isConsideredNegative } delayDescription features { id geometry properties } routePositiveBearing laneImpacts { positiveLaneImpact { laneCount lanesAffected { lanes } } negativeLaneImpact { laneCount lanesAffected { lanes } } } active verified ...DelayDescriptions ...Views ...NearbyResults } error { type } } } fragment DelayDescriptions on Event { delayDescriptions { currentDelay routeDesignator direction delayTime timeColor qualifier segmentDelays { delayDescription segmentDescription isMultiSegmentEvent } } } fragment Views on FeatureCollection { views(orderBy: LINEAR_REF_ASC) @include(if: $isCamerasEnabled) { uri title category __typename ... on RestAreaView { url isSatelliteView } ... on CameraView { url sources { type src } } ... on PlowCameraView { url } lastUpdated @include(if: $showCameraLastUpdated) { timestamp timezone } parentCollection { uri icon location { primaryLinearReference } } } } fragment NearbyResults on FeatureCollection { nearbyResults(layerSlugs: $layerSlugs) { __typename uri title cityReference bbox icon color location { primaryLinearReference secondaryLinearReference } ... on Event { quantities @include(if: $showCommercialQuantities) { label value icon } } views(limit: $nearbyViewLimit, orderBy: NEAREST_ASC) @include(if: $isCamerasEnabled) { uri category __typename ... on CameraView { url } ... on PlowCameraView { url } ... on SignComboView { imageUrl textJustification textLines } ... on SignTextView { textJustification textLines } ... on SignImageView { imageUrl } ... on SignOverlayView { travelTimes imageUrl imageLayout } ... on SignOverlayTPIMView { textLines imageUrl } parentCollection { uri location { primaryLinearReference } ... on Sign { signDisplayType signStatus gantrySigns { views { uri category title ... on SignImageView { imageUrl } } } } } } ... on RestArea { restAreaStatusSummary { header headerColor body bodyColor footer footerColor } } ... on Event { delayDescriptions { currentDelay routeDesignator direction delayTime timeColor qualifier segmentDelays { delayDescription segmentDescription isMultiSegmentEvent } } } } }","variables":{"layerSlugs":["winterDriving","roadReports","plowLocations","weatherRadar","weatherWarnings","chainLaws"],"eventId":"COSEG-320394","nearbyViewLimit":1,"isCamerasEnabled":true,"showCameraLastUpdated":true,"showCommercialQuantities":true}}]'
              };
              
              fetch('https://maps.cotrip.org/api/graphql', options)
                .then(response => response.json())
                .then(response => {
                    this.unstableScrapedData = response;
                    resolve(response);
                })
                .catch(err => reject(err));
        })
    }

    filterMapFeatures(key, search){
        let dataset = [...this.data[0].data.mapFeaturesQuery.mapFeatures, this.data[0].data.mapFeaturesQuery.mapFeatures]
        let data = this.data[0].data.mapFeaturesQuery.mapFeatures;
        var results = [];
        for(let item of data){
            if(item[key].indexOf(search)!==-1){
                results.push(item);
            }
        }
        return results;
    }
}

module.exports = {COTripUtil};