export default class AbortedError extends Error {
    constructor(message: string) {
      super(message);
    }
  }