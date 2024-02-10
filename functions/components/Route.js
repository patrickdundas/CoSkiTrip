class Route{
    constructor(name){
        this.name = name;
        this.globalIncidents = []
        this.subroutes = {}
        this.alerts = {}
    }

    addGlobalIncident(incident){
        if(incident.properties.type.toLowerCase().indexOf("chain law")){
            this.alerts["chainlaw"] = "Chain Law Enforced";
        }
        else if(incident.properties.type.toLowerCase().indexOf("traction law")){
            this.alerts["tractionlaw"] = "Traction Law Enforced";
        }
        else{
            this.globalIncidents.push(incident);
        }
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