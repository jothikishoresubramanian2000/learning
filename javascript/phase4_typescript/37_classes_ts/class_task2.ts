interface Logger{

    info(msg:string):void,
    error(msg:string): void
}

class ConsoleLogger implements Logger{

    info(msg: string): void{
        console.log(`INFO: ${msg}`)
    }

    error(msg: string): void {
        console.log(`ERROR: ${msg}`)
    }// tried with adding this method - Property 'error' does not exist on type 'ConsoleLogger'.
}

const myLogger = new ConsoleLogger();

myLogger.info("Server started");
myLogger.error("db failed")
