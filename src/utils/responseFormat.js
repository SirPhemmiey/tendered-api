/* eslint-disable object-curly-newline */
/* eslint-disable eol-last */
/* eslint-disable indent */
class ResponseFormat {
    static handleSuccess(res, obj) {
        const { status, statusCode, data, metadata } = obj;
        return res.status(200).json({
            statusCode,
            status,
            data,
            metadata,
        });
    }

    static handleError(res, obj) {
        res.status(obj.statusCode).json(obj);
    }


    // static handleAuth(obj) {
    //     const { res, status, statusCode, message, token } = obj;
    //     return res.status(statusCode).json({
    //         status,
    //         message,
    //         token
    //     });
    // }
}

module.exports = ResponseFormat;