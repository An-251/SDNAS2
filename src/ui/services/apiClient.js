import axios from 'axios';
import https from 'node:https';
import { apiBaseUrl, isHttps } from '../config/apiConfig.js';

const axiosOptions = {
  baseURL: apiBaseUrl,
  timeout: 10000,
};

if (isHttps) {
  // Allow self-signed certs for local HTTPS API.
  axiosOptions.httpsAgent = new https.Agent({ rejectUnauthorized: false });
}

export const apiClient = axios.create(axiosOptions);
