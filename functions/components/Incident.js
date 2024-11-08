class Incident {
    constructor(jsonObject) {
        this.type = jsonObject.type || "Feature";
        this.geometry = jsonObject.geometry ?
            new Geometry(
                jsonObject.geometry.type,
                jsonObject.geometry.coordinates,
                jsonObject.geometry.srid
            ) : null;

        // Mapping properties, including laneImpacts and detours
        this.properties = {
            id: jsonObject.properties.id || "",
            city: jsonObject.properties.city || "",
            injuries: jsonObject.properties.injuries || 0,
            startMarker: jsonObject.properties.startMarker || 0,
            endMarker: jsonObject.properties.endMarker || 0,
            type: jsonObject.properties.type || "",
            routeName: jsonObject.properties.routeName || "",
            isOversizedLoadsProhibited: jsonObject.properties.isOversizedLoadsProhibited || false,
            lastUpdated: jsonObject.properties.lastUpdated || "",
            startTime: jsonObject.properties.startTime || "",
            travelerInformationMessage: jsonObject.properties.travelerInformationMessage || "",
            patrolRoute: jsonObject.properties.patrolRoute || "",
            responseLevel: jsonObject.properties.responseLevel || "",
            owningGroup: jsonObject.properties.owningGroup || "",
            jurisdictions: jsonObject.properties.jurisdictions || [],
            direction: jsonObject.properties.direction || "",
            severity: jsonObject.properties.severity || "minor",
            lastUpdatedBy: jsonObject.properties.lastUpdatedBy || "",
            vehiclesInvolved: jsonObject.properties.vehiclesInvolved || 0,
            fatalities: jsonObject.properties.fatalities || 0,
            hasRampRestriction: jsonObject.properties.hasRampRestriction || false,
            detectionSource: jsonObject.properties.detectionSource || "",
            region: jsonObject.properties.region || "",
            category: jsonObject.properties.category || "",
            status: jsonObject.properties.status || "",
            laneImpacts: jsonObject.properties.laneImpacts ?
                jsonObject.properties.laneImpacts.map(impact => 
                    new LaneImpact(
                        impact.direction, 
                        impact.laneCount, 
                        impact.laneClosures, 
                        impact.closedLaneTypes
                    )
                ) : [],
            detours: jsonObject.properties.detours ?
                jsonObject.properties.detours.map(detour => 
                    new Detour(
                        detour.description, 
                        detour.active, 
                        detour.feature
                    )
                ) : [],
        };

        // Schedule handling
        this.properties.schedule = jsonObject.properties.schedule ?
            new Schedule(
                jsonObject.properties.schedule.startTime,
                jsonObject.properties.schedule.endTime,
                jsonObject.properties.schedule.daysOfWeek,
                jsonObject.properties.schedule.type
            ) : null;
    }

    getLaneImpact(){
        let results = {}

        for(let impact of this.properties.laneImpacts){
            let direction = impact.direction;
            let hexString = impact.laneClosures;

            // Convert hex to a binary string
            let binaryString = parseInt(hexString, 16).toString(2);
        
            // Pad the binary string to 16 bits
            binaryString = binaryString.padStart(16, '0');
        
            // Interpret the lane configuration
            const leftShoulderClosed = binaryString[0] === '1' ? 'Left shoulder closed' : 'Left shoulder open';
            const rightShoulderClosed = binaryString[15] === '1' ? 'Right shoulder closed' : 'Right shoulder open';
        
            // Iterate over lanes (excluding shoulders)
            const lanes = [];
            const closedCount = 0;
            for (let i = 1; i < 15; i++) {
                if (binaryString[i] === '1') {
                    // Lane numbering is from the median out
                    lanes.push(`Lane ${i} closed`);
                    closedCount++;
                }
            }
        
            // Combine the information
            const laneStatuses = [leftShoulderClosed, ...lanes, rightShoulderClosed];
            results[direction] = laneStatuses.filter(status => status.includes('closed')).join(', ') || 'All lanes and shoulders open';
        }

        return JSON.stringify(results);
        
    }

    toMarkdown(){
        let result = ""
        let lastUpdated = new Date(this.properties.lastUpdated).toLocaleString('en-US', { timeZone: 'America/Denver' });
        result += `### ${this.properties.type} / ${this.properties.category}\n`
        result += `${this.properties.travelerInformationMessage}\n\n`
        result += `_Updated by CDOT: ${lastUpdated}_\n\n`
        return result;
    }
}

class Detour {
    constructor(description, active, feature) {
        this.description = description;
        this.active = active;
        this.feature = feature; // Assuming the feature is a WKT string
    }
}

class Schedule {
    constructor(startTime, endTime, daysOfWeek, type) {
        this.startTime = startTime;
        this.endTime = endTime;
        this.daysOfWeek = daysOfWeek;
        this.type = type;
    }
}


class Geometry {
    constructor(type, coordinates, srid) {
        this.type = type;
        this.coordinates = coordinates;
        this.srid = srid;
    }
}

class LaneImpact {
    constructor(direction, laneCount, laneClosures, closedLaneTypes) {
        this.direction = direction;
        this.laneCount = laneCount;
        this.laneClosures = laneClosures;
        this.closedLaneTypes = closedLaneTypes;
    }
}

module.exports = {Incident}