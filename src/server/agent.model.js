var mongoose = require('mongoose');

var agentSchema = mongoose.Schema({
    isOnline: Boolean
});

var Agent = mongoose.model('Agent', agentSchema);

module.exports = Agent;
