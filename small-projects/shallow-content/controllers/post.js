module.exports = {
  main: function main(req, res) {
    res.render('createPost', { message: req.flash('error') });
  },

  createPost: function createPost(req, res) {
  },
};
