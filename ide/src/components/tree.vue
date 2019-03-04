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
            <div @click="rename">{{ $t('FolderMenuTitle.Rename') }}</div>
            <div @click="saveas">{{ $t('FolderMenuTitle.Saveas') }}</div>
            <div @click="remove">{{ $t('FolderMenuTitle.Remove') }}</div>
        </div>
    </div>
   
</template>
<script>
import slvuetree from "sl-vue-tree"
import {Namespace} from "../common/const.js"
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
            return this.$store.state[Namespace.PROJECT].projects
        },
    },
    created() {
        this.nodes = this.$store.state[Namespace.PROJECT].projects
    },
    methods: {
        nodeclick(n, event) {
            if (!n || n == undefined) {
                return
            }
            const level = n.level 
            const session = this.$store.state[Namespace.EDITOR].editor.getSession()
            if (level == 1) {
                this.$store.commit(`${Namespace.PROJECT}/setCurrentFile`, '')
                session.setValue('')
                return
            }
            const name = n.title
            this.$store.commit(`${Namespace.PROJECT}/setCurrentFile`, name)
            let code = this.$store.state[Namespace.PROJECT].codes[name]
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
            this.$store.commit(`${Namespace.PROJECT}/removeFile`, this.opNode.title)
            this.$emit("remove", this.opNode.title)
        },
        rename() {
            this.contextMenuIsVisible = false;
            this.$emit('rename', this.opNode.title)
        },
        saveas() {
            this.contextMenuIsVisible = false;
            this.$emit('saveas', this.opNode.title)
        }
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
    border-top: 1px solid;
    border-left: 1px solid;
    border-right: 1px solid;
    border-color: rgba(81, 81, 90, 0.5);
}
.contextmenu > div {
    padding: 6px;
    border-bottom: 1px solid;
    border-bottom-color: rgba(81, 81, 90, 0.5)
}
.contextmenu > div:hover {
    background-color: rgba(119, 159, 247, 0.5);
}

.toggle-img > img {
    width: 14px;
    height: 14px;
    
}
</style>