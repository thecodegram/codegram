export class LogMuter {
    private readonly logger = {
        log: console.log,
        error: console.error
    };
    private logBuffer = '';
    private isMuted = false;

    muteLogs() {
        this.isMuted = true;
        console.log = (msg) => {
            this.logBuffer += JSON.stringify(msg) + '\n';
        }
        console.error = (msg) => {
            this.logBuffer += "ERROR: " + JSON.stringify(msg) + '\n';
        }
    }
    flushLogs() {
        this.logger.log(this.logBuffer);
        this.logBuffer='';
    }

    unmuteLogs() {
        this.isMuted = false;
        console.log = this.logger.log;
        console.error = this.logger.error;
        this.logBuffer = '';
    }

    checkIfIsMuted() {
        this.logger.log(this.isMuted);
    }
}

export const logMuter = new LogMuter(); 