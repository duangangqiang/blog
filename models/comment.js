var mongodb = require("./db");

function Comment(name, day, title, comment) {
    this.name = name;
    this.day = day;
    this.title = title;
    this.comment = comment;
}

module.exports = Comment;

//存储一条留言信息
Comment.prototype.save = function(callback) {
    var name = this.name,
        day = this.day,
        title = this.title,
        comment = this.comment;

    mongodb.open(function(err, db) {
        if (err) {
            return callback(err);
        }

        //读取posts集合
        db.collection("posts", function(err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }

            //将文档插入Posts集合
            collection.update({
                "name": name,
                "time.day": day,
                "title": title
            }, {
                $push: {"comments": comment}
            }, function(err) {
                mongodb.close();
                if (err) {
                    return callback(err);
                }
                callback(null);
            });
        });
    })
};