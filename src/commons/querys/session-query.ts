export const SELECT_SESSION = {
    id              : true,
    name            : true,
    spaceId         : true,
    isEnglish       : true,
    chairsAvailable : true,
    date            : true,
    dayModule       : {
        select: {
            id      : true,
            dayId   : true,
            module  : {
                select: {
                    id          : true,
                    code        : true,
                    startHour   : true,
                    endHour     : true,
                    difference  : true,
                }
            }
        }
    },
    professor: {
        select: {
            id      : true,
            name    : true,
        }
    },
    planningChange : {
        select :{
            id: true
        }
    },
    section : {
        select : {
            id          : true,
            code        : true,
            startDate   : true,
            endDate     : true,
            building    : true,
            subject     : {
                select: {
                    id      : true,
                    name    : true,
                }
            }
        }
    }
}