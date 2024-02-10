class Route{
    constructor(name){
        this.name = name;
        this.globalIncidents = []
        this.subroutes = {}
    }

    addGlobalIncident(incident){
        this.globalIncidents.push(incident);
    }

    addSubroute(subroute){
        if(!Object.keys(this.subroutes).includes(subroute.direction)){
            this.subroutes[subroute.direction] = subroute
        }
    }

    getSubroute(direction){
        return this.subroutes[direction];
    }

    hasSubroute(name){
        return Object.keys(this.subroutes).includes(name);
    }
}

module.exports = {Route}