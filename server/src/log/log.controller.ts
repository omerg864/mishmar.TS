import { Body, Controller, Post } from '@nestjs/common';


@Controller('api/logs')
export class LogController {

    @Post('')
    async FailLogs(@Body() body: {err: Object, path: string, user: Object, component: string}) {
        console.log('Failed:', body);
    }
}
