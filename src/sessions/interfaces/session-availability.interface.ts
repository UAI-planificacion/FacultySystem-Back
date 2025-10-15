import { $Enums } from 'generated/prisma';


export interface AvailableSpace {
	id       : string;
	name     : string;
	building : $Enums.Building;
	type     : $Enums.SpaceType;
	capacity : number;
}


export interface AvailableProfessor {
	id        : string;
	name      : string;
	available : boolean;
}


export interface ScheduledDate {
	date        : Date;
	dayModuleId : number;
	dayName     : string;
	timeRange   : string;
}


export interface SessionAvailabilityResponse {
	session             : $Enums.SessionName;
	availableSpaces     : AvailableSpace[];
	availableProfessors : AvailableProfessor[];
	scheduledDates      : ScheduledDate[];
	isReadyToCreate     : boolean;
}
