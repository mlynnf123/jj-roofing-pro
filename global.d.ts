// This file is used to declare global types that are not part of any specific module.
// In this case, we are extending the global Window interface to include the `gapi`
// object that is loaded from the Google API script. This prevents TypeScript
// errors when accessing `window.gapi`.

declare global {
  interface Window {
    gapi: any;
  }
}

// This file must be a module to augment the global scope.
// An empty export is a common way to achieve this.
export {};
