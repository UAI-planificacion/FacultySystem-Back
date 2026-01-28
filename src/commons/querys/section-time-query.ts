export const SELECT_SECTION_TIME = {
    id: true,
    name: true,
    spaceId: true,
    isEnglish: true,
    chairsAvailable: true,
    date: true,
    dayModuleId: true,
    professor: {
        select: {
            id: true,
            name: true
        }
    },
    dayModule: {
        select: {
            id: true,
            dayId: true,
            module: {
                select: {
                    id: true,
                    code: true,
                    startHour: true,
                    endHour: true,
                    difference: true
                }
            }
        }
    },
    section: {
        select: {
            id: true,
            code: true,
            isClosed: true,
            startDate: true,
            endDate: true,
            quota: true,
            registered: true,
            subject: {
                select: {
                    id: true,
                    name: true
                }
            },
            period: {
                select: {
                    id: true,
                    name: true,
                    startDate: true,
                    endDate: true,
                    openingDate: true,
                    closingDate: true
                }
            }
        }
    }
}