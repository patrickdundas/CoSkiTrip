class Subroute{
    constructor(direction){
        this.direction = direction;
        this.incidents = []
        this.destinations = []
        this.isOpen = true;
        this.numLanes = 0;
    }
    addIncident(incident){
        this.incidents.push(incident)
    }
    addDestination(destination){
        this.destinations.push(destination)
    }
}

module.exports = {Subroute}