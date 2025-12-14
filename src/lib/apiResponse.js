/**
 * API Response Utilities
 * Standardized response formats for consistency
 */

/**
 * Success response
 */
export function successResponse(data, message = 'Success', statusCode = 200) {
    return Response.json(
        {
            success: true,
            message,
            data
        },
        { status: statusCode }
    );
}

/**
 * Error response
 */
export function errorResponse(message, errors = null, statusCode = 400) {
    const response = {
        success: false,
        error: message
    };

    if (errors) {
        response.errors = errors;
    }

    return Response.json(response, { status: statusCode });
}

/**
 * Not found response
 */
export function notFoundResponse(resource = 'Resource') {
    return Response.json(
        {
            success: false,
            error: `${resource} not found`
        },
        { status: 404 }
    );
}

/**
 * Server error response
 */
export function serverErrorResponse(error) {
    console.error('Server Error:', error);

    return Response.json(
        {
            success: false,
            error: 'Internal server error',
            ...(process.env.NODE_ENV === 'development' && { details: error.message })
        },
        { status: 500 }
    );
}

/**
 * Validation error response
 */
export function validationErrorResponse(errors) {
    return Response.json(
        {
            success: false,
            error: 'Validation failed',
            errors
        },
        { status: 422 }
    );
}
