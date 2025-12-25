export const SELECT_SECTION = {
        id              : true,
        code            : true,
        isClosed        : true,
        groupId         : true,
        startDate       : true,
        endDate         : true,
        spaceSizeId     : true,
        spaceType       : true,
        workshop        : true,
        lecture         : true,
        tutoringSession : true,
        laboratory      : true,
        quota           : true,
        registered      : true,
        building        : true,
        professor: {
            select : {
                id      : true,
                name    : true,
            }
        },
        subject: {
            select: {
                id      : true,
                name    : true,
            }
        },
        period      : {
            select: {
                id          : true,
                name        : true,
                startDate   : true,
                endDate     : true,
                openingDate : true,
                closingDate : true,
            }
        },
        sessions: {
            select: {
                id          : true,
                spaceId     : true,
                dayModule   : {
                    select      : {
                        dayId       : true,
                        moduleId    : true,
                    }
                },
                professor: {
                    select: {
                        id      : true,
                        name    : true,
                    }
                },
            }
        },
        request : {
            select: {
                id: true,
            }
        },
        _count: {
            select: {
                sessions: true
            }
        },
    }