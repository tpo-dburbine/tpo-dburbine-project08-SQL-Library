const express = require('express');
const router = express.Router();
const Books = require('../models').Book

/* GET home page. */
/* router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
}); */


function asyncHandler (cb) {
  return async (req, res, next) => {
    try {
      await cb(req, res, next)
    } catch (error) {
      res.status(500).send(error)
    }
  }
}

router.get('/', asyncHandler(async (req, res) => {
  const books = await Books.findAll({ order: [['createdAt', 'DESC']] })
  // const books = await Books.findAll()
  console.log(books)
  res.render('index', { books, title: 'Books' })
}))

router.get('/books', (req, res, next) => {
  res.redirect('/')
})

router.get('/books/new', (req, res, next) => {
  res.render('new-book', { books: {}, title: 'New Book' })
})

router.post('/books/new/create', asyncHandler(async (req, res) => {
  const book = await Books.create(req.body)
  res.redirect('/books/' + book.id)
}))

router.get('/books/:id', asyncHandler(async (req, res) => {
  const books = await Books.findByPk(req.params.id)
  if (books) {
    res.render('update-book', { books })
  } else {
    res.sendStatus(404)
  }
}))

router.post('/books/:id', asyncHandler(async (req, res) => {
  const book = await Books.findByPk(req.params.id)
  if (book) {
    await book.update(req.body)
    res.redirect('/books/' + book.id)
  } else {
    res.sendStatus(404)
  }
}))

router.post('/books/:id', asyncHandler(async (req, res) => {
  const book = await Books.findByPk(req.params.id)
  if (book) {
    await book.destroy()
    res.redirect('/books')
  } else {
    res.sendStatus(404)
  }
}))

module.exports = router;