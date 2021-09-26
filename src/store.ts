import { createStore } from 'vuex'
import { Game } from './api'

const store = createStore({
  state: {
    selectedGame: 0,
    games: Array<Game>()
  },
  mutations: {
    select (state, index) {
      state.selectedGame = index
    },
    setGames (state, games) {
      state.games = games
    },
    installGame (state, game: Game) {
      const idx = state.games.findIndex(e => e.id === game.id)
      state.games[idx].installed = game.installed
    }
  }
})

export default store
