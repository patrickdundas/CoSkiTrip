# CoSkiTrip
Reddit Bot for monitoring and alerting on Colorado ski resort access road closures and alerts

## Contributing

- Fork the repository
- Make your desired changes in `./functions/app.js`
- Note: `./functions/index.js` is for cloud infrastructure configuration and the GCP entrypoint, changes here usually won't be approved
- Open a pull request and tag @patrickdundas

Don't know how to code? [Submit a feature request here](https://docs.google.com/forms/d/e/1FAIpQLScMMk92aItLTRZCoUmWYMRa4eEStU6Zgi-MgmAUslFHVTpFgw/viewform)

## Running Locally

### Prerequisites
- Get a CDOT API Key
    - [Generate a CDOT API Key Here](https://manage-api.cotrip.org/login)
    - [Learn more about the CDOT Data Feed](https://www.cotrip.org/help/section/for-developers.html)
    - [CDOT API Docs](https://docs.google.com/document/d/1pVDW5iRiRsAWcixw5Z9umPFRspuOUJUdH2YLpYfltP4/edit?usp=sharing)
- Setup required environment variables
    - `CDOT_API_KEY`: Your CDOT API Key
- Install Node.JS 20

### Run the app
```
$ cd functions
$ node ./runLocal.js
```
When running locally, reddit markdown is generated as a file at `./functions/output.md`

## Development Roadmap
[ ] Better sorting of route lane direction - "Both Directions" first, then a definite order of N/E/S/W  
[ ] Sort incidents by last updated time  
[ ] Filtering of certain incidents to "notifications" for conciseness, such as "chain law enforced" or "MEXL Open"  
[ ] Ask the community what data they would find useful (destinations, routes, etc)  
[ ] Go live in /r/COSnow  

## Infrastructure Information
- Infrastructure is paid for and managed by @patrickdundas
- The app runs on Firebase / Google Cloud Platform Cloud Functions, and is executed every 10 minutes
- PRs modifying the firebase config or firebase `./functions/index.js` files usually won't be approved