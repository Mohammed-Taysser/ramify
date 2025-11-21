
 

/**
 * Appends a trailing slash to a URL if it
 * doesn't already have one.
 * @param {string} url - A string representing a URL that may or may not have a
 * trailing slash.
 * @returns Returns the same `url` with a trailing slash added if it doesn't already have one.
 * @see https://developer.mozilla.org/en-US/docs/Web/API/URL_API/Resolving_relative_references#current_directory_relative
 */
function trailingSlashURL(url: string): string {
  return url.endsWith('/') ? url : `${url}/`;
}

export { trailingSlashURL };

