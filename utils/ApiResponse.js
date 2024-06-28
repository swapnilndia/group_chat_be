class ApiResponse {
  constructor(status = 200, message = "Success", data = {}) {
    this.status = status;
    this.message = message;
    this.data = data;
  }

  toJSON() {
    return {
      status: this.status,
      message: this.message,
      data: this.data,
    };
  }
}

export default ApiResponse;
