<template>
  <div class="console">
    <el-tabs v-model="tab" @tab-click="handleClick">
      <el-tab-pane label="console" name="console" v-show="!close">
        <div class="log-line" v-for="l in logs">
          <span style="width: 130px; ">{{getDate(l.date)}}</span>
          <span :style="levelClass(l.level)">[{{level(l.level)}}]:</span>
          <span>{{l.content}}</span>
        </div>
      </el-tab-pane>
    </el-tabs>
    <div class="menu-btns">
      <img src="../assets/delete.png" width="16px" height="16px" @click="cleanLog" />
      <img src="../assets/arrowhead-down.png" width="16px" height="16px" @click="dismiss" v-if="!close" />
      <img src="../assets/arrowhead-up.png" width="16px" height="16px" @click="dismiss" v-else />
    </div>
  </div>
</template>

<script>
  let moment = require("moment")
  import {
    Namespace,
    LogLevel,
  } from "../common/const.js"
  import {
    Logger
  } from "../utils/log.js"
  export default {
    name: 'Log',
    components: {},
    data() {
      return {
        tab: 'console',
        close: false,
      }
    },
    computed: {
      logs() {
        return this.$store.state[Namespace.LOG].logs
      },
    },
    created() {},
    methods: {
      cleanLog() {
        const log = new Logger(this.$store)
        log.clean()
      },
      getDate(date) {

        return moment(date).format("YYYY-MM-DD HH:MM:ss")
      },
      level(l) {
        switch (l) {
          case LogLevel.Debug: {
            return "DEBUG"
          }
          case LogLevel.Info: {
            return "INFO"
          }
          case LogLevel.Warn: {
            return "WARN"
          }
          case LogLevel.Error: {
            return "ERROR"
          }
        }

      },
      levelClass(l) {
        switch (l) {
          case LogLevel.Debug: {
            return `width: 60px;color: green;`
          }
          case LogLevel.Info: {
            return `width: 60px;color: #409EFF;`
          }
          case LogLevel.Warn: {
            return `width: 60px;color: yellow;`
          }
          case LogLevel.Error: {
            return `width: 60px;color: red;`
          }
        }
      },
      handleClick() {},
      dismiss() {
        this.close = !this.close
        this.$emit("close", this.close)
      }
    }
  }

</script>

<style scoped>
  .console {
    position: relative;
  }

  .el-tabs {
    margin-top: 10px;
    border: 1px solid;
    border-color: rgb(220, 223, 230);
    height: calc(100%-10px);
    overflow: hidden;
    padding-left: 10px;
    padding-right: 10px;
  }

  .el-tab-pane {
    height: 14vh;
    overflow: scroll;
  }

  .menu-btns {
    width: 100px;
    height: 40px;
    position: absolute;
    top: 0;
    right: 10px;
    line-height: 40px;
    text-align: right;
  }

  .menu-btns>img:hover {
    opacity: 0.7;
    cursor: pointer;
  }

  .log-line {
    font-size: 13px;
  }

  .log-line>span {
    display: inline-block;

  }

</style>
