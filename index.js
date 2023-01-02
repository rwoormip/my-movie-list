const BASE_URL = 'https://webdev.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/movies/'
const POSTER_URL = BASE_URL + '/posters/'

const movies = []
let filteredMovies = []

const MOVIES_PER_PAGE = 12
let currentMode = 'cardMode'
let currentPage = 1

const dataPanel = document.querySelector('#data-panel')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')
const paginator = document.querySelector('#paginator')
const renderMode = document.querySelector('#render-mode')
const cardModeIcon = document.querySelector('#card-mode')
const listModeIcon = document.querySelector('#list-mode')

function renderAllMovies() {
  axios
    .get(INDEX_URL)
    .then((response) => {
      movies.push(...response.data.results)
      renderPaginator(movies.length)
      renderMovieCardMode(getMoviesByPage(currentPage))
    })
    .catch((err) => console.log(err))
}

function renderMovieMode(data) {
  if (currentMode === 'cardMode') {
    renderMovieCardMode(getMoviesByPage(currentPage))
  } else if (currentMode === 'listMode') {
    renderMovieListMode(getMoviesByPage(currentPage))
  }
}

function renderMovieListMode(data) {
  cardModeIcon.classList.remove('active')
  listModeIcon.classList.add('active')

  let rawHTML = ''
  rawHTML += `<ul class="list-group mb-2">`

  data.forEach((item) => {
    rawHTML += `
      <li class="list-group-item d-flex justify-content-between">
        <h5>${item.title}</h5>
        <div class="">
          <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal" data-bs-target="#movie-modal" data-id="${item.id}">More</button>
          <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
        </div>
      </li>
    `
  })
  rawHTML += `</ul>`
  dataPanel.innerHTML = rawHTML
}

function renderMovieCardMode(data) {
  cardModeIcon.classList.add('active')
  listModeIcon.classList.remove('active')

  let rawHTML = ''
  data.forEach((item) => {
    rawHTML += `
      <div class="col-sm-3">
        <div class="mb-2">
          <div class="card">
            <img
              src="${POSTER_URL + item.image}"
              class="card-img-top" alt="Movie Poster">
            <div class="card-body">
              <h5 class="card-title">${item.title}</h5>
            </div>
            <div class="card-footer">
              <button class="btn btn-primary btn-show-movie" 
                data-bs-toggle="modal" data-bs-target="#movie-modal" 
                data-id="${item.id}">
                More
              </button>
              <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
            </div>
          </div>
        </div>
      </div>
    `
  })
  dataPanel.innerHTML = rawHTML
}

function renderPaginator(amount) {
  const numberOfPages = Math.ceil(amount / MOVIES_PER_PAGE)
  let rawHTML = ''

  for (let page = 1; page <= numberOfPages; page++) {
    if (page === currentPage) {
      rawHTML += `<li class="page-item active"><a class="page-link" href="#" data-page="${page}">${page}</a></li>`
    } else {
      rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>`
    }
    paginator.innerHTML = rawHTML
  }
}

function getMoviesByPage(page) {
  const data = filteredMovies.length ? filteredMovies : movies
  const startIndex = (page - 1) * MOVIES_PER_PAGE

  return data.slice(startIndex, startIndex + MOVIES_PER_PAGE)
}

function showMovieModal(id) {
  const modalTitle = document.querySelector('#movie-modal-title')
  const modalImage = document.querySelector('#movie-modal-image')
  const modalDate = document.querySelector('#movie-modal-date')
  const modalDescription = document.querySelector('#movie-modal-description')
  axios.get(INDEX_URL + id).then((response) => {
    const data = response.data.results
    modalTitle.innerText = data.title
    modalDate.innerText = 'Release date:' + data.release_date
    modalDescription.innerText = data.description
    modalImage.innerHTML = `<img src="${POSTER_URL + data.image}" alt="movie-poster" class="img-fluid">`
  })
}

function addToFavorite(id) {
  const list = JSON.parse(localStorage.getItem('favoriteMovies')) || []
  const movie = movies.find((movie) => movie.id === id)

  if (list.some((movie) => movie.id === id)) {
    return alert('此電影已經在收藏清單中！')
  }

  list.push(movie)
  localStorage.setItem('favoriteMovies', JSON.stringify(list))
}

searchForm.addEventListener('submit', function onSearchFormSubmitted(event) {
  event.preventDefault()

  const keyword = searchInput.value.trim().toLowerCase()

  filteredMovies = movies.filter((movie) =>
    movie.title.toLowerCase().includes(keyword)
  )

  if (filteredMovies.length === 0) {
    return alert(`您輸入的關鍵字：${keyword} 沒有符合條件的電影`)
  }

  currentPage = 1
  renderPaginator(filteredMovies.length)
  renderMovieMode(getMoviesByPage(currentPage))
})

renderMode.addEventListener('click', function onRenderModeClicked(event) {
  if (event.target.matches('#card-mode')) {
    currentMode = 'cardMode'
    renderMovieCardMode(getMoviesByPage(currentPage))
  } else if (event.target.matches('#list-mode')) {
    currentMode = 'listMode'
    renderMovieListMode(getMoviesByPage(currentPage))
  }
})

dataPanel.addEventListener('click', function onPanelClicked(event) {
  if (event.target.matches('.btn-show-movie')) {
    showMovieModal(Number(event.target.dataset.id))
  } else if (event.target.matches('.btn-add-favorite')) {
    addToFavorite(Number(event.target.dataset.id))
  }
})

paginator.addEventListener('click', function onPaginatorClicked(event) {
  if (event.target.tagName !== 'A') return

  const activePage = document.querySelector('#paginator .active')
  activePage.classList.remove('active')
  if (event.target.matches('.page-link')) {
    event.target.parentElement.classList.add('active')
  }

  const page = Number(event.target.dataset.page)

  currentPage = page
  renderMovieMode(getMoviesByPage(currentPage))
})

renderAllMovies()