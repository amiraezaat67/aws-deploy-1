
export const globalErrorHandler = (err, req, res, next) => {
    if (err) {
        res.status(err['cause'] ||  500 ).json({ message: 'Something went wrong', error: err.message})
    }
}