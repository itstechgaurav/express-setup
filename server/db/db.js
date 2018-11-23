var mongoose = require('mongoose');
mongoose.set('useCreateIndex', true);
mongoose.connect(process.env.DB_HOST, {
    useNewUrlParser: true,
    auth: {
        user: process.env.DB_USER,
        password: process.env.DB_PASS
    }
});


mongoose.connection.on("error", () => {
    console.log("!!!Connected");
})

module.exports = mongoose
