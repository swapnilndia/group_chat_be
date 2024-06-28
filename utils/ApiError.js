class ApiError extends Error {
  constructor(status = 500, message = "Internal Server Error", errors = {}) {
    super(message);
    this.status = status;
    this.errors = errors;
  }

  toJSON() {
    return {
      status: this.status,
      message: this.message,
      errors: this.errors,
      timestamp: new Date().toISOString(), // Add timestamp to all errors
    };
  }
}

export default ApiError;
