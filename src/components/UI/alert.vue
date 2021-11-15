<template>
    <div class="dialog-mask" v-if="arg.show">
        <div class="dialog-container">
            <div class="title" v-if="arg.title">{{ arg.title }}</div>
            <div class="content">{{ arg.content }}</div>
            <div class="oper">
                <div class="cancel-btn" :style="'color:' + arg.cancelColor" v-if="arg.showCancel" @click="OnCancel">
                    {{ arg.cancelText }}
                </div>
                <div :style="'color:' + arg.confirmColor" @click="OnConfirm">
                    {{ arg.confirmText }}
                </div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: "vue-ui-alert",
    props: {
        options: Object,
    },
    data() {
        return {
            defaultOptions: {
                show: false,
                title: "",
                content: "",
                confirmText: "确定",
                confirmColor: "#2e87f0",
                showCancel: false,
                cancelText: "取消",
                cancelColor: "#b2b2b4",
                onConfirm: null,
                onCancel: null,
            },
            arg: {},
        };
    },
    watch: {
        options: function (newVal) {
            var _arg = {};
            Object.assign(_arg, this.defaultOptions, newVal, { show: true });
            this.arg = _arg;
        },
    },
    methods: {
        OnConfirm() {
            this.arg.show = false;
            if (this.arg.onConfirm) this.arg.onConfirm();
        },
        OnCancel() {
            this.arg.show = false;
            if (this.arg.onCancel) this.arg.onCancel();
        },
    },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.dialog-mask {
    position: fixed;
    left: 0;
    top: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999999;
}
.dialog-container {
    background: #1e1e1e;
    color: #eee;
    border-radius: 6px;
    padding-top: 10px;
    width: 70%;
}
.dialog-container .title {
    font-size: 14px;
    font-weight: bold;
    padding: 0 15px 0 15px;
    color: #fff;
    margin-top: 10px;
    text-align: center;
}
.dialog-container .content {
    padding: 0 15px 0 15px;
    margin-top: 10px;
    font-size: 13px;
    color: #eee;
    text-align: center;
}
.dialog-container .oper {
    margin-top: 15px;
    border-top: 1px #252526 solid;
    height: 40px;
    display: flex;
}
.dialog-container .oper div {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
}
.dialog-container .oper .cancel-btn {
    border-right: 1px #252526 solid;
}
</style>
