import { Logger, ValidationPipe }           from '@nestjs/common';
import { NestFactory }                      from '@nestjs/core';
import { DocumentBuilder, SwaggerModule }   from '@nestjs/swagger';

import { AppModule }    from '@app/app.module';
import { ENV }          from '@config/envs';


( async () => {
    const {
        PORT,
        NODE_ENV,
        API_PREFIX,
        API_DOC_PREFIX,
        CORS_ORIGIN
    }           = ENV();
    const logg  = new Logger( 'Main' );
    const app   = await NestFactory.create( AppModule );

    app
    .useGlobalPipes( new ValidationPipe({
        transform: true,
        whitelist: true
    }))
    .setGlobalPrefix( API_PREFIX )
    .enableCors({
        origin      : CORS_ORIGIN,
        methods     : ['GET', 'POST', 'DELETE', 'PATCH'],
        credentials : true,
    });

    const config = new DocumentBuilder()
        .setTitle( 'Faculty System API' )
        .setDescription( 'API for managing faculties, subjects, staff, and requests' )
        .setVersion( '1.0' )
        .build();

    const document = SwaggerModule.createDocument(app, config);

    SwaggerModule.setup(API_DOC_PREFIX, app, document);

    await app.listen( PORT );

    logg.log(`Environment: ${NODE_ENV}`);
    logg.log(`Application is running on: ${await app.getUrl()}`);
    logg.log(`Swagger documentation available at: ${await app.getUrl()}/${API_PREFIX}`);
})();
