import axios from 'axios'
import { ipcRenderer } from 'electron'
import { Store, useStore } from 'vuex'

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
    installed: boolean;
}
// Github token - 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, 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
const ORGName = 'VBPO-spongia-hry'
const requester = axios.create({
  baseURL: 'https://api.github.com/',
  timeout: 1000,
  // auth len kvoli zvyseniu rate limitu z 60 na 5000 requestov/h
  auth: {
    password: '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',
    username: 'Stanko2'
  }
})

async function getGameNames () : Promise<GameMetaData[]> {
  const res = await requester.get(`/orgs/${ORGName}/repos`)
  return res.data.filter((e:any) => e.language === 'C#').map((e: { name: string, id: number }) => {
    return {
      name: e.name,
      id: e.id
    } as GameMetaData
  })
}

export async function FetchAllGameData (): Promise<Game[]> {
  const names = await getGameNames()
  const games: Game[] = []
  for (const name of names) {
    const desc = requester.get(`/repos/${ORGName}/${name.name}/contents/README.md`).catch(_e => Promise.resolve(undefined))
    const icon = requester.get(`/repos/${ORGName}/${name.name}/contents/icon.png`).catch(_e => Promise.resolve(undefined))
    const Screenshots = requester.get(`/repos/${ORGName}/${name.name}/contents/Screenshots`).catch(_e => Promise.resolve(undefined))
    const res = await Promise.all([desc, icon, Screenshots])
    games.push({
      ...name,
      Screenshots: res[2]?.data.map((e: any) => e.download_url),
      description: res[0]?.data.download_url,
      icon: res[1]?.data.download_url,
      installed: await installed(name.name),
      version: '1.0.0',
      downloadUrl: await getDownloadUrl(name.name)
    })
  }
  console.log(games)
  return games
}

async function getDownloadUrl (name: string) {
  const platform = localStorage.getItem('platform')
  const res = await requester.get(`/repos/${ORGName}/${name}/releases`)
  console.log(res.data)
  return res.data[0]?.assets.find((e: any) => e.name.match(platform)).browser_download_url
}

async function installed (gameName: string): Promise<boolean> {
  return new Promise<boolean>((resolve, reject) => {
    ipcRenderer.send('isInstalled', gameName)
    ipcRenderer.once('isInstalled', (_e, data) => resolve(data))
  })
}

export async function updateInstalledGames (store: Store<any>):Promise<void> {
//   console.log(store.state.games[0])
  for (const game of store.state.games as Game[]) {
    game.installed = await installed(game.name)
    console.log(game.installed)
    store.commit('installGame', game)
  }
}
