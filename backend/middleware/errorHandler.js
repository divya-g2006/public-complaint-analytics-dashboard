export function notFound(req, res, next) {
  const err = new Error(`Not Found: ${req.originalUrl}`);
  res.status(404);
  next(err);
}

export function errorHandler(err, req, res, _next) {
  let statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;

  // Mongoose bad ObjectId
  if (err.name === "CastError") {
    statusCode = 400;
    err.message = "Invalid identifier.";
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    statusCode = 409;
    err.message = "Duplicate value for a unique field.";
  }

  // Mongoose validation
  if (err.name === "ValidationError") {
    statusCode = 400;
  }

  res.status(statusCode).json({
    message: err.message || "Server error"
  });
}

