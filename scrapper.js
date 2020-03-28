const fetch = require('node-fetch')
const cheerio = require('cheerio')

const searchURl = 'https://www.imdb.com/find?&s=tt&ttype=ft&ref_=fn_ft&q='
const movieURl = 'https://www.imdb.com/title/'

function searchMovies(searchTerm){
    if(searchCash[searchTerm]){
        return Promise.resolve(searchCash[searchTerm])
    }
    return fetch(`${searchURl}${searchTerm}`)
        .then(response => response.text())
        .then(body => {
            const $ = cheerio.load(body)
    
            const movies = []
    
            $('.findResult').each( (i, el) => {
                const $element = $(el)
                const $title = $element.find('td.result_text a')
                const $image = $element.find('td a img')
                const imdb_ID = $title.attr('href').match(/title\/(.*)\//)[1]
    
                const movie = {
                    image: $image.attr('src'),
                    title: $title.text(),
                    imdb_ID
                }
                movies.push(movie)
            })
            searchCash[searchTerm] = movies
    
            return movies
        })
}


const movieCach = {}
const searchCash = {}


function getMovie(imdbID){
    if(movieCach[imdbID]){
        return Promise.resolve(movieCach[imdbID])
    }
    return fetch(`${movieURl}${imdbID}`)
        .then(response => response.text())
        .then(body => {
            const $ = cheerio.load(body)

            const $title = $('.title_wrapper h1')
            const title = $title.first().contents().filter( function() {
                return this.type === 'text'
            }).text().trim()

            const videoLink = $('a[data-type="recommends"]').attr('href')

            
            const rating = $('.subtext').first().contents().filter( function() {
                return this.type === 'text'
            }).text().trim().substr(0, 5)

            const time = $('time').first().contents().filter(function() {
                return this.type === 'text';
              }).text().trim()

            const genres = []
            let releasedIn = ""
            let counter = 1
            $('.subtext a').each( (i, el) => {
                const genre = $(el).text()
                if(counter == 4)
                    releasedIn = genre.trim()
                else{
                    genres.push(genre)
                    counter++
                }
            })


            const imdbRating = $('span[itemprop=ratingValue]').text()
            const poster = $('div.poster a img').attr('src')
            const summary = $('.summary_text').text().trim()


            const directors = []
            const writers = []
            const stars = []
            $('.credit_summary_item a').each( (i, el) => {
                const $href = $(el)
                const $char = $href.attr('href').slice(-2)

                const name = $href.text();
                      
                if($char == 'dr')
                    directors.push(name)
                else{
                    if($char == 'wr')
                        writers.push(name)
                    else if($char == 'sm')
                        stars.push(name)
                }
            })
            stars.pop()


            const storyLine = $('.canwrap p span').text()

            


            const movie = {
                imdbID, 
                title,
                videoLink: `https://www.imdb.com${videoLink}`,
                rating,
                time,
                date_Published : releasedIn,
                genres,
                imdb_rating: imdbRating,
                poster,
                summary,
                directors,
                writers,
                stars,
                storyLine
            }

            movieCach[imdbID] = movie
            return movie
        })
}



module.exports = {
    searchMovies,
    getMovie
}