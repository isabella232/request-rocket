import axios from 'axios';

export default class RestClient {
  constructor(timeoutInMilliseconds = 60000) {
    this.client = axios.create({
      transformResponse: response => response,
      timeout: timeoutInMilliseconds
    });
  }

  async send(requestOptions) {
    try {
      return await this.client(requestOptions);
    } catch (error) {
      if (error.response) {
        return error.response;
      } else if (error.code === 'ECONNABORTED') {
        throw new Error(error.message);
      } else {
        throw new Error('Unexpected error occurred');
      }
    }
  }
}
