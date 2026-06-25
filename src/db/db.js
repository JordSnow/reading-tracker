const API_URL = import.meta.env.VITE_API_URL;
const API_SECRET = import.meta.env.VITE_API_SECRET;

async function apiFetch(path, options = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_SECRET}`,
      ...options.headers,
    },
  });
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json();
}

export async function initDB() {
  // no-op — DB lives in D1 now
}

export async function getBooksByStatus(status) {
  const books = await apiFetch("/books");
  return books.filter((b) => b.status === status);
}

export async function getBookById(id) {
  return apiFetch(`/books/${id}`);
}

export async function addBook(book) {
  return apiFetch("/books", {
    method: "POST",
    body: JSON.stringify(book),
  });
}

export async function updateBook(id, fields) {
  return apiFetch(`/books/${id}`, {
    method: "PATCH",
    body: JSON.stringify(fields),
  });
}

export async function deleteBook(id) {
  return apiFetch(`/books/${id}`, { method: "DELETE" });
}

export async function startBook(id, startedDate) {
  return apiFetch(`/books/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ status: "Table", started_date: startedDate }),
  });
}

export async function updateProgress(id, currentPage) {
  return apiFetch(`/books/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ current_page: currentPage }),
  });
}

export async function finishBook(id, completedDate, rating) {
  return apiFetch(`/books/${id}`, {
    method: "PATCH",
    body: JSON.stringify({
      status: "Library",
      completed_date: completedDate,
      rating: rating || null,
    }),
  });
}

export async function moveBookToShelf(id) {
  return apiFetch(`/books/${id}`, {
    method: "PATCH",
    body: JSON.stringify({
      status: "Shelf",
      started_date: null,
      randomly_rolled: false,
    }),
  });
}

export async function getTableCount() {
  const books = await apiFetch("/books");
  return books.filter((b) => b.status === "Table").length;
}

export async function getRollEligibleBooks() {
  const books = await apiFetch("/books");
  return books.filter(
    (b) => b.status === "Shelf" && b.roll_eligible && !b.is_unreleased,
  );
}

export async function acceptRoll(id) {
  return apiFetch(`/books/${id}`, {
    method: "PATCH",
    body: JSON.stringify({
      status: "Table",
      started_date: new Date().toISOString().split("T")[0],
      randomly_rolled: true,
    }),
  });
}

export async function getAllBookTitles() {
  const books = await apiFetch("/books");
  return books.map((b) => ({
    title: b.title.toLowerCase(),
    status: b.status,
  }));
}

export function getCoverUrl(book, size = "M") {
  if (book.cover_url) return book.cover_url;
  if (book.cover_i)
    return `https://covers.openlibrary.org/b/id/${book.cover_i}-${size}.jpg`;
  return null;
}
