var mongoose = require('./mongoose')

var articleSchema = mongoose.Schema({
    title: {
        type: 'string',
        required: true
    },
    content: {
        type: 'string',
        required: true
    }
});

var articleModel = mongoose.model("article", articleSchema);
module.exports =  articleModel;
