<template>
  <el-scrollbar>
    <div v-if="game">
      <el-carousel
        v-if="game.Screenshots || game.trailer"
        height="60vh"
        style="backgroun-color: black"
      >
        <el-carousel-item v-if="game.trailer">
          <iframe
            :src="game.trailer"
            v-if="game.trailer.match('youtube.com')"
            style="width: 100%; height: 100%"
          ></iframe>
          <video
            :src="game.trailer"
            autoplay
            style="width: 100%; height: 100%"
          ></video>
        </el-carousel-item>
        <el-carousel-item v-for="item in game.Screenshots" :key="item">
          <el-image
            :src="item"
            fit="scale-down"
            style="width: 100%; height: 100%"
          ></el-image>
        </el-carousel-item>
      </el-carousel>
      <el-empty v-else description="No images"></el-empty>
      <div class="content">
        <markdown :source="description"></markdown>
        <el-button variant="primary" @click="downloadWindows()">
          Download For Windows
        </el-button>
        <el-button variant="primary" @click="downloadLinux()">
          Download For Linux
        </el-button>
      </div>
    </div>
    <div v-else class="content">
      <h1>Vitaj!</h1>
      <p>
        Vies tu jednoducho najst a nainstalovat si vsetky nase hry, ktore sme
        naprogramovali na
        <a href="https://www.smnd.sk/mikey/PHP/spongia">spongiu</a>. Pre
        automaticke instalovanie a pohodlne spustanie hier si vies stiahnut nas
        launcher
        <el-button variant="primary" @click="downloadLauncherWindows()">
          Download Launcher For Windows
        </el-button>
        <el-button variant="primary" @click="downloadLauncherLinux()">
          Download Launcher For Linux
        </el-button>
      </p>
    </div>
  </el-scrollbar>
</template>

<script lang="ts">
import { useStore } from 'vuex'
import { defineComponent } from 'vue'
import axios from 'axios'
import { Game } from '@/api'
import Markdown from './Markdown.vue'
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
  data() {
    return {
      game: undefined,
      description: 'Loading ...',
      installInprogress: false,
      installProgress: 0,
      installSize: 1
    } as data
  },
  mounted(): void {
    const store = useStore()
    store.subscribe((mutation) => {
      if (mutation.type !== 'select') return
      this.game = store.state.games[mutation.payload - 1]
      console.log(this.game)
      axios.get(this.game?.description || '').then(res => {
        this.description = res.data
      })
    })
  },
  methods: {
    downloadLinux() {
      location.href = this.game?.downloads.linux || location.href
    },
    downloadWindows() {
      location.href = this.game?.downloads.windows || location.href
    },
    downloadLauncherWindows() {
      location.href = 'https://github.com/VBPO-spongia-hry/VBPO-Spongia-hry.github.io/releases/download/GameLauncher/game-launcher.Setup.0.1.0.exe'
    },
    downloadLauncherLinux() {
      location.href = 'https://github.com/VBPO-spongia-hry/VBPO-Spongia-hry.github.io/releases/download/GameLauncher/game-launcher-0.1.0.AppImage'
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
