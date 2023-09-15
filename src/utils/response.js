const httpStatusCode = require('../constants/httpStatusCode');

function formatServiceReturn(status, code, data = null, message = null) {
    return { status, code, data, message };
}

function isClientErrorCategory(code) {
    return code >= 400 && code <= 500;
}

function sendResponse(res, code, message, data, error) {
    const result = {
        message,
        success: true
    };

    if (data) {
        result.data = data;
    }

    if (isClientErrorCategory(code)) {
        result.success = false;
    }

    if (error) {
        result.success = false;
        result.error = process.env.NODE_ENV == 'local' ? error : null;
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
        res.setHeader('Content-Disposition', attachment, filename = "${fileName}");
    }
    res.setHeader('Content-type', mimeType);
    if (mimeType.includes('csv')) {
        res.end(data);
    } else {
        res.end(Buffer.from(data), 'binary');
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
            result: array
        };
        return result;
    },
    prepareListResponseCustom: function (currentPage, total, array, perPage, sort, filter) {
        const result = {
            previousPage: currentPage > 1 ? currentPage - 1 : null,
            nextPage: (total / perPage) > currentPage ? currentPage + 1 : null,
            currentPage,
            perPage,
            total,
            sort,
            filter,
            data: array
        };
        return result;
    },
    ok: function ({ res, message, data }) {
        sendResponse(res, httpStatusCode.OK, message, data);
    },
    created: function ({ res, message, data }) {
        sendResponse(res, httpStatusCode.CREATED, message, data);
    },
    accepted: function ({ res, message, data }) {
        sendResponse(res, httpStatusCode.ACCEPTED, message, data);
    },
    badRequest: function ({ res, message, err }) {
        let code = httpStatusCode.BAD_REQUEST;
        let msg = message;

        if (err && err?.message) {
            msg = err.message;
        }

        if (message?.code) {
            code = message.code;
            msg = message.message;
        }

        sendResponse(res, code, msg, null, err);
    },
    unauthorized: function ({ res, message, err }) {
        sendResponse(res, httpStatusCode.UNAUTHORIZED, message, null, err);
    },
    notFound: function ({ res, message, err }) {
        sendResponse(res, httpStatusCode.NOT_FOUND, message, null, err);
    },
    conflict: function ({ res, message, err }) {
        sendResponse(res, httpStatusCode.CONFLICT, message, null, err);
    },
    internalError: function ({ res, message = 'Internal Server Error', err }) {
        sendResponse(res, httpStatusCode.INTERNAL_SERVER_ERROR, message, null, err);
    },
    csvFile: function ({ res, fileName, data }) {
        buildFileResponse(res, 200, 'text/csv', fileName, data);
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
    }
};