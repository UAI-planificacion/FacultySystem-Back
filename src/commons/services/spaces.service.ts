import { $Enums } from 'generated/prisma';

import { ENV } from '@config/envs';


interface Skill {
    capacity    : number,
    aforo       : number,
    mts2        : number | null,
    num_enchufe : number,
    foto        : string | null,
    building    : $Enums.Building,
    floor       : number | null,
    type        : $Enums.SpaceType,
    size        : $Enums.SizeValue,
}


interface LovVals {
    created_at  : Date | null,
    skill       : Skill, 
    active      : boolean,
    comment     : string | null,
    description : string,
    idlovvals   : number,
}


interface Lov {
    created_at  : Date | null,
    skill       : any,
    description : string,
    active      : boolean,
    comment     : string,
    idlov       : number,
    lov_vals    : LovVals[],
}


interface Space {
    id          : number;
    name        : string;
    active      : boolean;
    capacity    : number;  
    building    : $Enums.Building;
    type        : $Enums.SpaceType;
    size        : $Enums.SizeValue;
}


export class SpacesService {
    
    /**
     * Fetches spaces from external reservation API with retry logic
     * @returns Promise<Space[]> Array of mapped spaces
     * @throws Error if all retry attempts fail
     */
    async getSpaces(): Promise<Space[]> {
        const maxRetries = 2;
        let lastError: Error | null = null;

        for ( let attempt = 0; attempt <= maxRetries; attempt++ ) {
            try {
                const spaces = await this.#fetchSpacesFromAPI();
                return spaces;
            } catch ( error ) {
                lastError = error instanceof Error ? error : new Error( String( error ) );

                if ( attempt < maxRetries ) {
                    console.warn( `Attempt ${attempt + 1} failed. Retrying...`, lastError.message );
                    await this.#delay( 1000 * ( attempt + 1 ) ); // Exponential backoff
                }
            }
        }

        throw new Error( `Failed to fetch spaces after ${maxRetries + 1} attempts: ${lastError?.message}` );
    }


    /**
     * Makes HTTP GET request to external API and maps response to Space[]
     * @returns Promise<Space[]>
     * @throws Error if request fails or response is invalid
     */
    async #fetchSpacesFromAPI(): Promise<Space[]> {
        const API_RESERVATION   = ENV().API_RESERVATION;
        const SPACE_ENDPOINT    = ENV().SPACE_ENDPOINT;
        const url               = `${API_RESERVATION}/${SPACE_ENDPOINT}`;

        const response = await fetch( url, {
            method  : 'GET',
            headers : {
                'Content-Type' : 'application/json',
            },
        });

        if ( !response.ok ) {
            throw new Error( `HTTP error! status: ${response.status} - ${response.statusText}` );
        }

        const data: Lov = await response.json();

        if ( !data || !Array.isArray( data.lov_vals ) ) {
            throw new Error( 'Invalid response format: missing lov_vals array' );
        }

        return this.#mapLovToSpaces( data );
    }


    /**
     * Maps Lov response to Space[] array
     * @param lov Lov object from external API
     * @returns Space[] array
     */
    #mapLovToSpaces = ( lov: Lov ): Space[] => {
        return lov.lov_vals
            .map(( lovVal: LovVals ) => ({
                id          : lovVal.idlovvals,
                name        : lovVal.description,
                active      : lovVal.active,
                capacity    : lovVal.skill.capacity,
                building    : lovVal.skill.building,
                type        : lovVal.skill.type,
                size        : lovVal.skill.size,
            }));
    }


    /**
     * Utility function to delay execution
     * @param ms Milliseconds to delay
     * @returns Promise<void>
     */
    #delay = ( ms: number ): Promise<void> => {
        return new Promise( resolve => setTimeout( resolve, ms ) );
    }

}