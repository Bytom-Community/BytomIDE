<template>
    <div @click="contextMenuIsVisible = false">
        <slvuetree v-model="nodes"
         ref="tree" 
         @nodeclick="nodeclick"
         @nodecontextmenu="showContextMenu" 
         style="height:100%">
        
         <template slot="toggle" slot-scope="{ node }">
             <div class="toggle-img">
                    <img src="../assets/triangle_arrow-down.png"   v-if="node.isExpanded">
                    <img src="../assets/triangle_arrow-right.png"   v-else>
             </div>
        </template>

        </slvuetree>
        <div class="contextmenu" ref="contextmenu" v-show="contextMenuIsVisible">
            <div @click="rename">重命名</div>
            <div @click="remove">删除</div>
        </div>
    </div>
   
</template>
<script>
import slvuetree from "sl-vue-tree"
import {sNamespace} from "../common/const.js"
export default {
    name: 'tree',
    components: { slvuetree },
    data() {
        return {
            nodes: [],
            contextMenuIsVisible: false,
            opNode: null,
        }
    },
    watch: {
        projects: {
            handler: function(newValue, v) {
                this.nodes = newValue
            },
            deep: true
        }
    },
    computed: {
        projects() {
            return this.$store.state[sNamespace.PROJECT].projects
        },
    },
    created() {
        this.nodes = this.$store.state[sNamespace.PROJECT].projects
    },
    methods: {
        nodeclick(n, event) {
            if (!n || n == undefined) {
                return
            }
            const level = n.level 
            const session = this.$store.state[sNamespace.EDITOR].editor.getSession()
            if (level == 1) {
                this.$store.commit(`${sNamespace.PROJECT}/setCurrentFile`, '')
                session.setValue('')
                return
            }
            const name = n.title
            this.$store.commit(`${sNamespace.PROJECT}/setCurrentFile`, name)
            let code = this.$store.state[sNamespace.PROJECT].codes[name]
            if (!code || code == undefined || !code.length) {
                code = ''
            }
            session.setValue(code)
        },
        showContextMenu(node, event) {
            event.preventDefault();
            this.contextMenuIsVisible = true;
            const $contextMenu = this.$refs.contextmenu;
            $contextMenu.style.left = event.clientX + 'px';
            $contextMenu.style.top = event.clientY + 'px';
            this.opNode = node
        },
        remove() {
            this.contextMenuIsVisible = false;
            if(!this.opNode || !this.opNode.title || !this.opNode.title.length) {
                return
            }
            this.$store.commit(`${sNamespace.PROJECT}/removeFile`, this.opNode.title)
            this.$emit("remove", this.opNode.title)
            // const paths = this.$refs.tree.getSelected().map(node => node.path);
            // console.log("remove paths", paths)
            // this.$refs.tree.remove(paths)
        },
        rename() {
            this.contextMenuIsVisible = false;
            this.$emit('rename', this.opNode.title)
        },
    }
}
</script>

<style scoped>

.contextmenu {
    position: absolute;
    background-color: white;
    color: black;
    border-radius: 2px;
    cursor: pointer;
    font-size:13px;     
}
.contextmenu > div {
    padding: 6px;
}
.contextmenu > div:hover {
    background-color: rgba(100, 100, 255, 0.5);
}

.toggle-img > img {
    width: 14px;
    height: 14px;
    
}
</style>