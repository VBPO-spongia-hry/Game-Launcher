<template>
    <el-menu
        default-active="0"
        background-color="#545c64"
        text-color="#fff"
        active-text-color="#ffd04b"
    >
        <el-menu-item index="0" @click="handleOpen(0)">
            Uvod
        </el-menu-item>
        <el-menu-item v-for="(game, i) in Games" :key="game.id" :index="i+1" @click="handleOpen(i+1)">
            <el-row align="middle">
                <el-col :span="4">
                    <el-avatar :size="50" :src="game.icon" class="game-icon">S</el-avatar>
                </el-col>
                <el-col :span="20" class="name-text">{{ game.name }}</el-col>
            </el-row>
        </el-menu-item>
    </el-menu>
</template>

<script lang="ts">
import { ElLoading } from 'element-plus'
import { FetchAllGameData, Game } from '@/api'
import { defineComponent } from 'vue-demi'
import { useStore } from 'vuex'

export default defineComponent({
  data () {
    return {
      Games: Array<Game>(),
      $store: useStore()
    }
  },
  created ():void {
    const loading = ElLoading.service({
      lock: true,
      text: 'Loading...',
      spinner: 'el-icon-loading',
      background: 'rgba(0, 0, 0, 0.7)'
    })
    FetchAllGameData().then((e) => {
      this.Games = e
      this.$store.commit('setGames', e)
      loading.close()
    })
  },
  methods: {
    handleOpen (key: number) {
      this.$store.commit('select', key)
    }
  }
})
</script>

<style lang="scss">
.game-icon {
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: var(--el-color-primary);
}
.name-text {
    text-align: left;
    text-overflow: ellipsis;
    padding-left: 20px;
    // font-weight: 400;
}
.el-menu-item.is-active > .name-text {
    font-weight: 900;
}
</style>
