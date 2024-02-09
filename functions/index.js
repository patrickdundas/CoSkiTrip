/**
 * Configuration for firebase cloud functions
 * Contributors: Ignore this file. Scraping functionality is in ./app.js main()
 */

const { onSchedule } = require("firebase-functions/v2/scheduler");
const {defineSecret} = require("firebase-functions/params");
const {main} = require("./app");

const PROJECT_API_KEY = defineSecret('PROJECT_API_KEY');
const PROJECT_MESSAGE_SENDER_ID = defineSecret('PROJECT_MESSAGE_SENDER_ID')
const PROJECT_APP_ID = defineSecret('PROJECT_APP_ID')

const REDDIT_CLIENT_ID = defineSecret("REDDIT_CLIENT_ID")
const REDDIT_CLIENT_SECRET = defineSecret("REDDIT_CLIENT_SECRET")
const REDDIT_REFRESH_TOKEN = defineSecret("REDDIT_REFRESH_TOKEN")
const REDDIT_USER_AGENT = defineSecret("REDDIT_USER_AGENT")
const REDDIT_POST_ID = defineSecret("REDDIT_POST_ID")

const COTRIP_API_KEY = defineSecret("COTRIP_API_KEY")

exports.redditScheduled = onSchedule(
  {
    schedule: "every 10 mins", 
    secrets: [PROJECT_API_KEY, PROJECT_APP_ID, PROJECT_MESSAGE_SENDER_ID, REDDIT_CLIENT_ID, REDDIT_CLIENT_SECRET, REDDIT_REFRESH_TOKEN, REDDIT_USER_AGENT, REDDIT_POST_ID, COTRIP_API_KEY]
  }, 

  (request, response) => {
    require("./utils/firebaseConfig") // initalize the app now that secrets are loaded
    main();
  }
);
