<template>
  <el-scrollbar>
    <div v-if="game">
      <el-carousel v-if="game.Screenshots" height="60vh" style="backgroun-color: black">
        <el-carousel-item v-for="item in game.Screenshots" :key="item">
          <el-image :src="item" fit="scale-down" style="width:100%; height:100%;"></el-image>
        </el-carousel-item>
      </el-carousel>
      <el-empty v-else description="No images"></el-empty>
      <div class="content">
        <markdown :source="description"></markdown>
        <div v-if="game.downloadUrl">
            <div v-if="game.installed">
                <el-button type="primary" @click="play()">Hrat</el-button>
                <el-button type="danger" @click="uninstall()">Vymazat</el-button>
            </div>
            <div v-else>
                <el-button type="success" :loading="installInprogress" @click="install()">Instalovat</el-button>
                <div class="progressBar" v-if="installInprogress">
                    <span>Downloading ...</span>
                    <el-progress
                    :text-inside="true"
                    :stroke-width="20"
                    :percentage="installProgress / installSize * 100"
                    >
                    <span>{{ (installProgress / installSize * 100).toFixed(2) }}%</span>
                    </el-progress>
                </div>
            </div>
        </div>
      </div>
    </div>
    <div v-else class="content">
        <h1>Vitaj!</h1>
        <p>Vies tu jednoducho najst a nainstalovat si vsetky nase hry, ktore sme naprogramovali na <a href="https://www.smnd.sk/mikey/PHP/spongia">spongiu</a>.</p>
    </div>
  </el-scrollbar>
</template>

<script lang="ts">
import { useStore } from 'vuex'
import { defineComponent } from 'vue'
import axios from 'axios'
import { Game } from '@/api'
import Markdown from './Markdown.vue'
import { ipcRenderer } from 'electron'
import { ElMessageBox } from 'element-plus'

interface data {
    game: Game | undefined;
    description: string;
    installInprogress: boolean;
    installProgress: number;
    installSize: number;
}

export default defineComponent({
  name: 'viewport',
  components: {
    Markdown
  },
  data () {
    return {
      game: undefined,
      description: 'Loading ...',
      installInprogress: false,
      installProgress: 0,
      installSize: 1
    } as data
  },
  mounted ():void {
    const store = useStore()
    store.subscribe((mutation) => {
      if (mutation.type !== 'select') return
      this.game = store.state.games[mutation.payload - 1]
      console.log(this.game)
      axios.get(this.game?.description || '').then(res => {
        this.description = res.data
      })
    })
    ipcRenderer.on('downloadProgress', (e, done, total) => {
      this.installProgress = done
      this.installSize = total
    })
    ipcRenderer.on('installFinished', (e) => {
      if (!this.game) return
      this.installInprogress = false
      this.game.installed = true
      store.commit('installGame', this.game)
    })
    ipcRenderer.on('error', (e, err) => {
      ElMessageBox.alert(err.toString(), 'Installation error', {
      })
      this.installInprogress = false
    })
  },
  methods: {
    install ():void {
      ipcRenderer.send('install', this.game?.name, this.game?.downloadUrl)
      this.installInprogress = true
    },
    uninstall ():void {
      if (!this.game) return
      ipcRenderer.send('uninstall', this.game.name)
      ipcRenderer.once('gameRemoved', (e) => {
        if (!this.game) return
        const store = useStore()
        this.game.installed = false
        store.commit('installGame', this.game)
      })
    },
    play ():void {
      ipcRenderer.send('play', this.game?.name)
    }
  }
})
</script>

<style scoped>
.content {
  padding: var(--el-main-padding);
  text-align: left;
}
.progressBar {
  position: fixed;
  bottom: 10px;
  left: 10px;
  width: 280px;
}
.progressBar span {
  color: var(--el-color-white);
  margin: 10px;
  width: 100%;
  text-align: center;
}
</style>
