
exports.getDate = function() {
    const today = new Date();

    const options = {
        day: 'numeric',
        month: 'numeric',
        year: 'numeric'
    }

    return today.toLocaleDateString("en-US", options);

}