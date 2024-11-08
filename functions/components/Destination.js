class Destination{
    constructor(displayName, travelTime){
        this.displayName = displayName;
        this.travelTime = travelTime;
    }
    toMarkdown(){
        return `| ${this.displayName} | ${this.travelTime/60} mins |\n`
    }
}

module.exports = {Destination}