import axios from 'axios'
import { Store } from 'vuex'

interface GameMetaData {
  name: string;
  id: number;
}

export interface Game extends GameMetaData {
  Screenshots?: string[];
  version: string;
  description?: string;
  downloadUrl?: string;
  icon?: string;
  trailer?: string;
  installed: boolean;
  downloads: {
    windows: string;
    linux: string;
  }
}
const ORGName = 'VBPO-spongia-hry'
const requester = axios.create({
  baseURL: 'https://api.github.com/',
  timeout: 1000
})

async function getGameNames(): Promise<GameMetaData[]> {
  const res = await requester.get(`/orgs/${ORGName}/repos`)
  return res.data.filter((e: any) => e.language === 'C#').map((e: { name: string, id: number }) => {
    return {
      name: e.name,
      id: e.id
    } as GameMetaData
  })
}

interface GameResponse {
  name: string;
  icon?: string;
  description?: string;
  version?: string;
  screenshots: string[];
  trailer: string;
  downloads: {
    windows: string;
    linux: string;
  }
}

export async function FetchAllGameData(): Promise<Game[]> {
  const names = await getGameNames()
  const games: Game[] = []
  for (const name of names) {
    const data: GameResponse = await (await axios.get(`https://raw.githubusercontent.com/${ORGName}/${name.name}/main/info.json`).catch(() => undefined))?.data
    if (data) {
      games.push({
        id: name.id,
        name: data.name,
        Screenshots: data.screenshots || [],
        description: data.description,
        icon: data.icon,
        trailer: data.trailer,
        installed: await installed(name.name),
        version: data.version || '1.0.0',
        downloads: data.downloads
      })
    }
  }
  return games
}

function getDownloadUrl(data: GameResponse) {
  const platform = localStorage.getItem('platform')
  console.log(data)
  return platform === 'win32' ? data.downloads.windows : data.downloads.linux
}

async function installed(gameName: string): Promise<boolean> {
  return false
}

export async function updateInstalledGames(store: Store<any>): Promise<void> {
  for (const game of store.state.games as Game[]) {
    game.installed = await installed(game.name)
    console.log(game.installed)
    store.commit('installGame', game)
  }
}
