<template>
    <div>
        <el-button icon="el-icon-setting" circle @click="open"></el-button>
        <el-dialog
            v-model="dialogVisible"
            title="Nastavenia"
            width="50%"
        >
        <div>
            <h3>Install location</h3>
            <el-input v-model="installLocation" disabled placeholder="Location">
                <template #append>
                    <div style="cursor: pointer" @click="browse()">Browse</div>
                </template>
            </el-input>
        </div>
        <template #footer>
        <span class="dialog-footer">
            <el-button @click="dialogVisible = false">Cancel</el-button>
            <el-button type="primary" @click="dialogVisible = false"
            >Confirm</el-button
            >
        </span>
        </template>
    </el-dialog>
    </div>
</template>

<script lang="ts">
import { ipcRenderer } from 'electron'
import { defineComponent } from 'vue'

export default defineComponent({
  mounted () {
    ipcRenderer.on('locationSelect', (e, newLoc: string) => {
      this.installLocation = newLoc
      localStorage.setItem('installLocation', newLoc)
    })
  },
  data () {
    return {
      installLocation: localStorage.getItem('installLocation'),
      dialogVisible: false
    }
  },
  methods: {
    open () {
      this.dialogVisible = true
    },
    browse () {
      ipcRenderer.send('locationSelect', this.installLocation)
    }
  }
})
</script>
