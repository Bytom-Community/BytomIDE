<template>
    <el-upload
        action=""
        :multiple=true
        :limit="maxUploadFile"
        :on-exceed="handleUploadExceed"
        :on-progress="handleUpload">
    <slot name="upload-item"></slot>
</el-upload>
</template>
<script>
import {readUploadFile} from "../utils/reader.js"
const config = require("../utils/config.js").config()
export default {
    name: 'upload',
    computed: {
        maxUploadFile() {
            return config.folder.maxUploadFile
        }
    },
    methods: {
        async handleUpload(event, file, fileList) {
            if (!file || !file.hasOwnProperty("name")) {
                this.$message(this.$t("AlertMessage.FileError"))
                return
            }
            try {
                const fileContent = await readUploadFile(file)
                this.$emit("onUpload", file["name"], fileContent)
            } catch (e) {
                this.$message(this.$t("AlertMessage.FileError"))
            }
        },
        handleUploadExceed(file, fileList) {
            this.$message(this.$t("AlertMessage.UploadTooMuch", { max: config.folder.maxUploadFile}))
        }
    }
}
</script>

<style scoped>
</style>