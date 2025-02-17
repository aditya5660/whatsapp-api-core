const httpStatusCode = require("../constants/httpStatusCode");

function formatServiceReturn(status, code, data = null, message = null) {
  return { status, code, data, message };
}

function isClientErrorCategory(code) {
  return code >= 400 && code <= 500;
}

function sendResponse(res, code, message, data, error) {
  const result = {
    message,
    success: true,
  };

  if (data) {
    result.data = data;
  }

  if (isClientErrorCategory(code)) {
    result.success = false;
  }

  if (error) {
    result.success = false;
    result.error = process.env.NODE_ENV == "local" ? error : null;
    console.error({ ...result, error });
  }

  res.status(code);
  res.json(result);
}

function buildError(code, message, referenceId) {
  const result = {};
  result.code = code;
  if (message instanceof Error) {
    result.message = message.message;
    console.error(message.message);
    console.error(message.stack);
  } else {
    result.message = message;
    console.error(message);
  }
  result.referenceId = referenceId;
  return result;
}

function buildFileResponse(res, code, mimeType, fileName, data) {
  res.status(code);

  if (fileName) {
    res.setHeader(
      "Content-Disposition",
      attachment,
      (filename = "${fileName}")
    );
  }
  res.setHeader("Content-type", mimeType);
  if (mimeType.includes("csv")) {
    res.end(data);
  } else {
    res.end(Buffer.from(data), "binary");
  }
}

class ResponseUtil {
  static ok({ res, message = "Success", data = null }) {
    res.setHeader("Content-Type", "application/json");
    return res.status(200).json({
      success: true,
      message,
      data,
    });
  }

  static badRequest({ res, message = "Bad Request", error = null }) {
    res.setHeader("Content-Type", "application/json");
    return res.status(400).json({
      success: false,
      message,
      error,
    });
  }

  static notFound({ res, message = "Not Found", error = null }) {
    res.setHeader("Content-Type", "application/json");
    return res.status(404).json({
      success: false,
      message,
      error,
    });
  }

  static internalError({
    res,
    message = "Internal Server Error",
    error = null,
  }) {
    res.setHeader("Content-Type", "application/json");
    return res.status(500).json({
      success: false,
      message,
      error,
    });
  }
}

module.exports = {
  formatServiceReturn,
  sendResponse,
  buildError,
  prepareListResponse: function (page, total, array, limit) {
    const result = {
      page,
      count: array.length,
      limit,
      total,
      result: array,
    };
    return result;
  },
  prepareListResponseCustom: function (
    currentPage,
    total,
    array,
    perPage,
    sort,
    filter
  ) {
    const result = {
      previousPage: currentPage > 1 ? currentPage - 1 : null,
      nextPage: total / perPage > currentPage ? currentPage + 1 : null,
      currentPage,
      perPage,
      total,
      sort,
      filter,
      data: array,
    };
    return result;
  },
  created: function ({ res, message, data }) {
    sendResponse(res, httpStatusCode.CREATED, message, data);
  },
  accepted: function ({ res, message, data }) {
    sendResponse(res, httpStatusCode.ACCEPTED, message, data);
  },
  conflict: function ({ res, message, err }) {
    sendResponse(res, httpStatusCode.CONFLICT, message, null, err);
  },
  unauthorized: function ({ res, message, err }) {
    sendResponse(res, httpStatusCode.UNAUTHORIZED, message, null, err);
  },
  conflict: function ({ res, message, err }) {
    sendResponse(res, httpStatusCode.CONFLICT, message, null, err);
  },
  internalError: function ({ res, message = "Internal Server Error", err }) {
    sendResponse(res, httpStatusCode.INTERNAL_SERVER_ERROR, message, null, err);
  },
  csvFile: function ({ res, fileName, data }) {
    buildFileResponse(res, 200, "text/csv", fileName, data);
  },
  formatClientErrorResponse(res, data, err) {
    const message = data?.message;

    if (data.code === httpStatusCode.CONFLICT) {
      this.conflict({ res, message, err });
    } else if (data.code === httpStatusCode.BAD_REQUEST) {
      this.badRequest({ res, message, err });
    } else if (data.code === httpStatusCode.INTERNAL_SERVER_ERROR) {
      let error = err;

      if (!err) {
        error = new Error(message);
      }

      this.internalError({ res, message, err: error });
    } else {
      this.notFound({ res, message, err });
    }
  },
};
