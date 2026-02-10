const success = (data, message = 'Success', statusCode = 200) => {
    return {
        success: true,
        message,
        data,
        statusCode
    };
};

const error = (message = 'An error occurred', statusCode = 500, errors = null) => {
    return {
        success: false,
        message,
        errors,
        statusCode
    };
};

module.exports = {
    success,
    error
};
