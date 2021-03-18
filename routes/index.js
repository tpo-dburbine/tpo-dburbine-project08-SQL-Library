const express = require('express');
const router = express.Router();
const Books = require('../models').Book
const createError = require('http-errors')
const {Op} = require('sequelize')

/* GET home page. */

let searchTerm = ''
/**
 *
 * @param {async function} cb
 * receives an async function and tries it. It returns the results of the cb or an error
 */

function asyncHandler (cb) {
  return async (req, res, next) => {
    try {
      await cb(req, res, next)
    } catch (error) {
      searchTerm = ''
      next(error)
    }
  }
}

/**
 *
 * @param {Array} arr
 * Takes the length of an array in order to determine the number of pages.
 */

function addPageCount (arr) {
  const count = arr.length
  const pageCount = Math.ceil(count / 5)
  return pageCount
}

/**
 *
 * @param {Array} arr
 * @param {Number} pageNumber
 * Takes an array and a number in order to determine the starting and ending position of the inputted array.
 * returns an array containing the results between the start and ending index.
 */

function bookPagination (arr, pageNumber) {
  const startIndex = (pageNumber * 5) - 5
  const endIndex = pageNumber * 5
  const filteredBooks = arr.slice(startIndex, endIndex)
  return filteredBooks
}

/**
 * @param {String} searchTerm
 * Queries the database and returns results that match the searchTerm
 */
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

// Redirect to main book listing
router.get('/', asyncHandler(async (req, res) => {
  searchTerm = ''
  res.redirect('/books/page/1')
}))

// Main book lisiting page
router.get('/books/page/:pageNumber', asyncHandler(async (req, res) => {
  const books = await dbQuery()
  const filteredBooks = bookPagination(books, req.params.pageNumber)
  const pageCount = addPageCount(books)
  if (req.params.pageNumber > pageCount) {
    throw createError(404)
  }
  res.render('index', { books: filteredBooks, pageCount, title: 'Books' })
}))

// Gets the create book page
router.get('/books/new', (req, res, next) => {
  res.render('new-book', { books: {}, title: 'New Book' })
})

// Creates the new book
router.post('/books/new/create', asyncHandler(async (req, res) => {
  let book
  try{
    book = await Books.create(req.body)
    res.redirect('/')
  } catch(error) {
    if (error.name === 'SequelizeValidationError') {
      book = await Books.build(req.body)
      res.render('new-book', { books: book, errors: error.errors, title: 'New Book' })
    } else {
      throw error;
    }
  }
}))

// Main book lisitng filtered by search term
router.post('/books/page/:pageNumber', asyncHandler(async (req, res) => {
  console.log(req.body.search)
  searchTerm = req.body.search
  const books = await dbQuery()
  const filteredBooks = bookPagination(books, req.params.pageNumber)
  const pageCount = addPageCount(books)
  res.render('index', { books: filteredBooks, pageCount, title: 'Books' })
}))

// Gets the update book page
router.get('/books/:id', asyncHandler(async (req, res) => {
  const books = await Books.findByPk(req.params.id)
  if (books) {
    res.render('update-book', { books, title: 'Update Book' })
  } else {
    throw createError(404)
  }
}))

// Posts any updates made
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

// Deletes selected book from the db
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