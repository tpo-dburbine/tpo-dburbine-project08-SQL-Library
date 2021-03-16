const express = require('express');
const router = express.Router();
const Books = require('../models').Book
const createError = require('http-errors')
const {Op} = require('sequelize')

/* GET home page. */
/* router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
}); */
let searchTerm = ''

function asyncHandler (cb) {
  return async (req, res, next) => {
    try {
      await cb(req, res, next)
    } catch (error) {
      next(error)
    }
  }
}

function addPageCount (arr) {
  const count = arr.length
  const pageCount = Math.ceil(count / 5)
  return pageCount
}

function bookPagination (arr, pageNumber) {
  const startIndex = (pageNumber * 5) - 5
  const endIndex = pageNumber * 5
  const filteredBooks = arr.slice(startIndex, endIndex)
  return filteredBooks
}

function dbQuery () {
  return Books.findAll({
    where: {
      [Op.or]: [
        { title: { [Op.like]: '%' + searchTerm + '%' } },
        { author: { [Op.like]: '%' + searchTerm + '%' } },
        { genre: { [Op.like]: '%' + searchTerm + '%' } },
        { year: { [Op.like]: '%' + searchTerm + '%' } }
      ]
    }
  })
}

router.get('/', asyncHandler(async (req, res) => {
  res.redirect('/books/page/1')
}))

router.get('/books/page/:pageNumber', asyncHandler(async (req, res) => {
  const books = await dbQuery()
  const filteredBooks = bookPagination(books, req.params.pageNumber)
  const pageCount = addPageCount(books)

  res.render('index', { books: filteredBooks, pageCount, title: 'Books' })
}))

router.get('/books/new', (req, res, next) => {
  res.render('new-book', { books: {}, title: 'New Book' })
})

router.post('/books/new/create', asyncHandler(async (req, res) => {
  await Books.create(req.body)
  res.redirect('/')
}))

router.post('/books/page/:pageNumber', asyncHandler(async (req, res) => {
  console.log(req.body.search)
  searchTerm = req.body.search
  const books = await dbQuery()
  const filteredBooks = bookPagination(books, req.params.pageNumber)
  const pageCount = addPageCount(books)
  res.render('index', { books: filteredBooks, pageCount, title: 'Books' })
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