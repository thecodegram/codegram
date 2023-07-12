export class ExternalApiError extends Error {
    statusCode: number;
    apiName: string;
    constructor(apiName: string, statusCode: number) {
      const message = `${apiName} return an undexpected status code ${statusCode}`;
      super(message);
      this.name = 'ExternalApiError';
      this.statusCode = statusCode;
      this.apiName = apiName;
    }
}