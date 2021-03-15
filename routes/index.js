const express = require('express');
const router = express.Router();
const Books = require('../models').Book
const createError = require('http-errors')
const {Op} = require('sequelize')

/* GET home page. */
/* router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
}); */

function asyncHandler (cb) {
  return async (req, res, next) => {
    try {
      await cb(req, res, next)
    } catch (error) {
      next(error)
    }
  }
}

router.get('/', asyncHandler(async (req, res) => {
  res.redirect('/books/page/1')
}))

router.get('/books/page/:pageNumber', asyncHandler(async (req, res) => {
  const books = await Books.findAll({ order: [['createdAt', 'DESC']] })
  const count = books.length
  const pageCount = Math.ceil(count / 5)
  const startIndex = (req.params.pageNumber * 5) - 5
  const endIndex = req.params.pageNumber * 5
  const filteredBooks = books.slice(startIndex, endIndex)

  res.render('index', { books: filteredBooks, pageCount, title: 'Books' })
}))

router.get('/books/new', (req, res, next) => {
  res.render('new-book', { books: {}, title: 'New Book' })
})

router.post('/books/new/create', asyncHandler(async (req, res) => {
  await Books.create(req.body)
  res.redirect('/')
}))

router.get('/books/:id', asyncHandler(async (req, res) => {
  const books = await Books.findByPk(req.params.id)
  if (books) {
    res.render('update-book', { books, title: 'Update Book' })
  } else {
    throw createError(404)
  }
}))

router.post('/books/:id/update', asyncHandler(async (req, res) => {
  let book
  try {
    book = await Books.findByPk(req.params.id)
    if (book) {
      await book.update(req.body)
      res.redirect('/')
    } else {
      res.sendStatus(404)
    }
  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      book = await Books.build(req.body)
      book.id = req.params.id
      res.render('update-book', { books: book, errors: error.errors, title: 'Edit Book' })
    } else {
      throw error;
    }
  }
}))

router.post('/books/:id/delete', asyncHandler(async (req, res) => {
  const book = await Books.findByPk(req.params.id)
  if (book) {
    await book.destroy()
    res.redirect('/')
  } else {
    res.sendStatus(404)
  }
}))

module.exports = router;