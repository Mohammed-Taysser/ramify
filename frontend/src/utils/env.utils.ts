import { trailingSlashURL } from './url.utils';

const SERVER_URL: string = import.meta.env.VITE_SERVER_URL;

// Throw an error if SERVER_URL is not defined
if (!SERVER_URL) {
  throw new Error('The VITE_SERVER_URL environment variable is not defined');
}
 

// Ensure SERVER_URL has a trailing slash
const serverURLWithSlash = trailingSlashURL(SERVER_URL);

// Throw an error if SERVER_URL is not a valid URL
if (!URL.canParse('/api', serverURLWithSlash)) {
  throw new Error('The VITE_SERVER_URL environment variable is not valid url');
}

const API_ENDPOINT = new URL('/api', serverURLWithSlash).href;

const ENV = { API_ENDPOINT, SERVER_URL: serverURLWithSlash };

export default ENV;
