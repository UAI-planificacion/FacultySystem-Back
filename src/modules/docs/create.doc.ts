import { CreateModuleDto } from "../dto/create-module.dto";

export const CREATE_MODULE_DOC = {
    SUMMARY : { summary: 'Create one or multiple modules' },
    RESPONSE_200: { status: 201, description: 'The module(s) has been successfully created.' },
    RESPONSE_400: { status: 400, description: 'Bad Request.' },
    API_BODY: {
        type        : CreateModuleDto,
        isArray     : true,
        description : 'List of module data to be created',
        examples    : {
            aModuleList: {
                summary : 'Example of multiple modules creation',
                value   : [
                    {
                        code        : 'M101',
                        difference  : 'A',
                        startHour   : '08:00',
                        endHour     : '09:00',
                        dayIds      : [1, 2]
                    },
                    {
                        code        : 'M102',
                        difference  : 'B',
                        startHour   : '09:30',
                        endHour     : '10:30',
                        dayIds      : [3]
                    }
                ],
            },
        },
    }
}