<template>
  <el-container>
    <el-header>
      <span>Game Launcher</span>
      <div class="settings-btn">
        <settings />
      </div>
    </el-header>
    <el-container>
        <el-aside width="300px"><sidebar /></el-aside>
        <el-main class="main" style="padding: 0"><viewport /></el-main>
    </el-container>
  </el-container>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component'
import Viewport from './components/Viewport.vue'
import Sidebar from './components/Sidebar.vue'
import Settings from './components/Settings.vue'

@Options({
  components: {
    Viewport,
    Sidebar,
    Settings
  }
})
export default class App extends Vue {}
</script>

<style lang="scss">
body {
  margin: 0;
  padding: 0;
  border: none;
  min-height: 100vh;
}
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}
.el-header,
.el-footer {
  background-color: #b3c0d1;
  color: var(--el-text-color-primary);
  text-align: center;
  line-height: 60px;
}

.el-aside {
  background-color: #545c64;
  color: var(--el-text-color-primary);
  text-align: center;
  line-height: 200px;
  height: calc(100vh - 60px);
}

.main {
  background-color: #e9eef3;
  color: var(--el-text-color-primary);
  text-align: center;
  padding: 0;
  height: calc(100vh - 60px);
  width: calc(100vw - 300px);
  overflow: auto;
}

body > .el-container {
  margin-bottom: 40px;
}
.settings-btn {
  position: absolute;
  right: 10px;
  top: 0;
}
</style>
