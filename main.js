const bItemId = "itemId";
const iConmplateB = "incompleteBookshelfList";
const cBookList = "completeBookshelfList";

const establishBook = (judulBuku, penulisBuku, tahunBuku, isBookComplete) => {
    const teksJudul = document.createElement("h3");
    teksJudul.innerText = judulBuku;

    const teksPenulis = document.createElement("p");
    teksPenulis.innerText = "Penulis: " + penulisBuku;

    const teksTahun = document.createElement("p");
    teksTahun.innerText = "Tahun: " + tahunBuku;

    const textContainer = document.createElement("ARTICLE");
    textContainer.classList.add("book_item");
    textContainer.append(teksJudul, teksPenulis, teksTahun);

    const buttonContainer = document.createElement("div");
    buttonContainer.classList.add("action");

    if (isBookComplete) {
        buttonContainer.append(createNotFinishedButton("Belum Selesai Dibaca"), createDeleteButton("Hapus Buku"));
    } else {
        buttonContainer.append(createFinishedButton("Selesai Dibaca"), createDeleteButton("Hapus Buku"));
    }

    textContainer.append(buttonContainer);

    return textContainer;
};
// menambahkan buku
const addBook = () => {
    const incompleteBooksList = document.getElementById(iConmplateB);
    const completeBooksList = document.getElementById(cBookList);

    const judulBuku = document.getElementById("inputBookTitle").value;
    const penulisBuku = document.getElementById("inputBookAuthor").value;
    const tahunBuku = document.getElementById("inputBookYear").value;
    const checkboxValue = document.querySelector("#inputBookIsComplete").checked;

    const bookCreated = establishBook(judulBuku, penulisBuku, tahunBuku, checkboxValue);
    const bookObject = compileBookObjek(judulBuku, penulisBuku, tahunBuku, checkboxValue);
    bookCreated[bItemId] = bookObject.id;
    books.push(bookObject);

    Swal.fire({
        title: "yesss!",
        text: "Buku sukses ditambahkan",
        icon: "success",
        confirmButtonText: "OK",
    });
    if (checkboxValue) {
        completeBooksList.append(bookCreated);
        updateBooksToStorage();
    } else {
        incompleteBooksList.append(bookCreated);
        updateBooksToStorage();
    }
};

// buku selesai dibaca
const addBookSelesai = (book) => {
    const title = book.querySelector(".book_item > h3").innerText;
    const author = book.querySelectorAll(".book_item > p")[0].innerText.slice(8);
    const year = book.querySelectorAll(".book_item > p")[1].innerText.slice(7);

    const newBook = establishBook(title, author, year, true);
    const bookFound = findBook(book[bItemId]);
    bookFound.isBookComplete = true;
    newBook[bItemId] = bookFound.id;

    const completeBooksList = document.getElementById(cBookList);
    completeBooksList.append(newBook);
    book.remove();

    updateBooksToStorage();
};

// buku belum selesai dibaca
const addBookNotSelesai = (book) => {
    const title = book.querySelector(".book_item > h3").innerText;
    const author = book.querySelectorAll(".book_item > p")[0].innerText.slice(8);
    const year = book.querySelectorAll(".book_item > p")[1].innerText.slice(7);

    const newBook = establishBook(title, author, year, false);
    const bookFound = findBook(book[bItemId]);
    bookFound.isBookComplete = false;
    newBook[bItemId] = bookFound.id;

    const incompleteBooksList = document.getElementById(iConmplateB);
    incompleteBooksList.append(newBook);
    book.remove();
    updateBooksToStorage();
};

// mengembalikan 
const removeBook = (book) => {
    const bookPosition = findBookIndex(book[bItemId]);
    books.splice(bookPosition, 1);
    book.remove();
    updateBooksToStorage();
};
const createButton = (buttonTypeClass, eventListener, text) => {
    const button = document.createElement("button");
    button.innerText = text;
    button.classList.add(buttonTypeClass);

    button.addEventListener("click", (btn) => {
        eventListener(btn);
    });

    return button;
};
const createNotFinishedButton = (text) => {
    return createButton(
        "green",
        (btn) => {
            addBookNotSelesai(btn.target.parentElement.parentElement);
        },
        text
    );
};
const createFinishedButton = (text) => {
    return createButton(
        "green",
        (btn) => {
            addBookSelesai(btn.target.parentElement.parentElement);
        },
        text
    );
};
const createDeleteButton = (text) => {
    return createButton(
        "red",
        (btn) => {
            const message = Swal.fire({
                title: "kamu yakin?",
                text: "untuk menghapus bacaan ini",
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#8b0000",
                cancelButtonColor: "#006400",
                confirmButtonText: "Yaa, akan dihapus?",
            }).then((result) => {
                if (result.isConfirmed) {
                    Swal.fire("Hapus", "bacaan kamu sudah dihapus", "success");
                    removeBook(btn.target.parentElement.parentElement);
                }
            });
        },
        text
    );
};

// pencarian buku
const searchBooks = () => {
    const searchValue = document.getElementById("searchBookTitle").value;
    const incompleteBooksList = document.getElementById(iConmplateB);
    const completeBooksList = document.getElementById(cBookList);
    const previousBooks = document.querySelectorAll(".book_item");

    if (searchValue) {
        for (previousBook of previousBooks) {
            previousBook.remove();
        }

        const filteredBooks = books.filter((book) => book.title.toLowerCase().includes(searchValue.toLowerCase()));

        for (book of filteredBooks) {
            const newBook = establishBook(book.title, book.author, book.year, book.isBookComplete);
            newBook[bItemId] = book.id;

            if (book.isBookComplete) {
                completeBooksList.append(newBook);
            } else {
                incompleteBooksList.append(newBook);
            }
        }
    } else {
        for (previousBook of previousBooks) {
            previousBook.remove();
        }
        loadBooksFromStorage();
    }

    return books;
};

document.addEventListener("DOMContentLoaded", () => {
  const submitForm = document.getElementById("inputBook");

  submitForm.addEventListener("submit", (btn) => {
    btn.preventDefault();
    addBook();
  });
  if (isStorage()) {
    loadBooksFromStorage();
  }
  const submitSearch = document.getElementById("searchBook");

  submitSearch.addEventListener("submit", (btn) => {
    btn.preventDefault();
    searchBooks();
  });
});
document.addEventListener("ondatasaved", () => {
  console.log("Data berhasil disimpan.");
});

document.addEventListener("ondataloaded", () => {
  refreshBookFromBooks();
});

// cek apakah browser mendukung local storage
let books = [];
const STORAGE_KEY = "BOOK_APPS";

const isStorage = () => {
  if (typeof Storage === undefined) {
    alert("Browser kamu tidak mendukung local storage");
    return false;
  }
  return true;
};
const findBook = (bookId) => {
  for (book of books) {
    if (book.id === bookId) return book;
  }
  return null;
};
function findBookIndex(bookId) {
  let index = 0;
  for (book of books) {
    if (book.id === bookId) return index;
    index++;
  }
  return -1;
}
const saveBooks = () => {
  const parsed = JSON.stringify(books);
  localStorage.setItem(STORAGE_KEY, parsed);
  document.dispatchEvent(new Event("ondatasaved"));
};
const loadBooksFromStorage = () => {
  const getBooks = localStorage.getItem(STORAGE_KEY);

  let data = JSON.parse(getBooks);

  if (data !== null) {
    books = data;
  }
  document.dispatchEvent(new Event("ondataloaded"));
};
const updateBooksToStorage = () => {
  if (isStorage()) {
    saveBooks();
  }
};
const compileBookObjek = (title, author, year, isBookComplete) => {
  return {
    id: +new Date(),
    title,
    author,
    year,
    isBookComplete,
  };
};
const refreshBookFromBooks = () => {
  const incompleteBooksList = document.getElementById(iConmplateB);
  const completeBooksList = document.getElementById(cBookList);

  for (book of books) {
    const newBook = establishBook(book.title, book.author, book.year, book.isBookComplete);
    newBook[bItemId] = book.id;

    if (book.isBookComplete) {
      completeBooksList.append(newBook);
    } else {
      incompleteBooksList.append(newBook);
    }
  }
};
