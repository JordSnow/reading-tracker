import { PGlite } from '@electric-sql/pglite'

export const db = new PGlite('idb://reading-tracker')

export async function initDB() {
    await db.exec(`
        CREATE TABLE IF NOT EXISTS books (
                                             id SERIAL PRIMARY KEY,
                                             title TEXT NOT NULL,
                                             author TEXT NOT NULL,
                                             status TEXT NOT NULL DEFAULT 'Shelf',
                                             page_count INTEGER,
                                             genre TEXT,
                                             notes TEXT,
                                             roll_eligible BOOLEAN DEFAULT true,
                                             is_unreleased BOOLEAN DEFAULT false,
                                             added_to_shelf_date DATE,
                                             started_date DATE,
                                             current_page INTEGER DEFAULT 0,
                                             completed_date DATE,
                                             rating INTEGER,
                                             randomly_rolled BOOLEAN DEFAULT false,
                                             series_name TEXT,
                                             series_number INTEGER,
                                             is_standalone BOOLEAN DEFAULT true,
                                             cover_i INTEGER
        );

        ALTER TABLE books ADD COLUMN IF NOT EXISTS cover_i INTEGER;
        ALTER TABLE books ADD COLUMN IF NOT EXISTS release_year INTEGER;
    `)
}

// Get all books with a given status
export async function getBooksByStatus(status) {
  const result = await db.query(
      `SELECT * FROM books WHERE status = $1 ORDER BY added_to_shelf_date DESC`,
      [status]
  )
  return result.rows
}

// Add a new book to the shelf
export async function addBook(book) {
    const result = await db.query(
        `INSERT INTO books (
            title, author, status, page_count, genre, notes,
            roll_eligible, is_unreleased, added_to_shelf_date,
            is_standalone, series_name, series_number, cover_i, release_year
        ) VALUES (
                     $1, $2, 'Shelf', $3, $4, $5,
                     $6, $7, CURRENT_DATE,
                     $8, $9, $10, $11, $12
                 ) RETURNING *`,
        [
            book.title,
            book.author,
            book.page_count || null,
            book.genre || null,
            book.notes || null,
            book.roll_eligible ?? true,
            book.is_unreleased ?? false,
            book.is_standalone ?? true,
            book.series_name || null,
            book.series_number || null,
            book.cover_i || null,
            book.release_year || null,
        ]
    )
    return result.rows[0]
}

// Delete a book
export async function deleteBook(id) {
  await db.query(`DELETE FROM books WHERE id = $1`, [id])
}

// Move a book from Shelf to Table
export async function startBook(id, startedDate) {
    await db.query(
        `UPDATE books SET status = 'Table', started_date = $1 WHERE id = $2`,
        [startedDate, id]
    )
}

// Update current page progress
export async function updateProgress(id, currentPage) {
    await db.query(
        `UPDATE books SET current_page = $1 WHERE id = $2`,
        [currentPage, id]
    )
}

// Finish a book - move to Library
export async function finishBook(id, completedDate, rating) {
    await db.query(
        `UPDATE books SET status = 'Library', completed_date = $1, rating = $2 WHERE id = $3`,
        [completedDate, rating || null, id]
    )
}

// Get count of books currently on the Table
export async function getTableCount() {
    const result = await db.query(`SELECT COUNT(*) as count FROM books WHERE status = 'Table'`)
    return parseInt(result.rows[0].count)
}

// Get all roll-eligible books
export async function getRollEligibleBooks() {
    const result = await db.query(
        `SELECT * FROM books 
     WHERE status = 'Shelf' 
     AND roll_eligible = true 
     AND is_unreleased = false`
    )
    return result.rows
}

// Accept a roll - move book to Table
export async function acceptRoll(id) {
    await db.query(
        `UPDATE books 
     SET status = 'Table', 
         started_date = CURRENT_DATE, 
         randomly_rolled = true 
     WHERE id = $1`,
        [id]
    )
}

export async function getAllBookTitles() {
    const result = await db.query(`SELECT title, status FROM books`)
    return result.rows.map(r => ({ title: r.title.toLowerCase(), status: r.status }))
}

export async function updateBook(id, fields) {
    await db.query(
        `UPDATE books SET
                          roll_eligible = $1,
                          notes = $2,
                          genre = $3,
                          is_unreleased = $4,
                          is_standalone = $5,
                          rating = $6,
                          started_date = $7,
                          completed_date = $8
         WHERE id = $9`,
        [
            fields.roll_eligible,
            fields.notes,
            fields.genre,
            fields.is_unreleased,
            fields.is_standalone,
            fields.rating || null,
            fields.started_date || null,
            fields.completed_date || null,
            id
        ]
    )
}

export async function moveBookToShelf(id) {
    await db.query(
        `UPDATE books SET status = 'Shelf', started_date = null, randomly_rolled = false WHERE id = $1`,
        [id]
    )
}