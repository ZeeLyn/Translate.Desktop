<template>
    <div class="toast-wrap">
        <transition name="fade">
            <div class="content" v-if="show">
                {{ message }}
            </div>
        </transition>
    </div>
</template>
<script>
export default {
    name: "Toast",

    data() {
        return {
            show: false,
            message: "",
        };
    },
    methods: {
        showToast(message) {
            clearTimeout(this.timer);
            this.show = true;
            this.message = message;
            var self = this;
            this.timer = setTimeout(() => {
                self.show = false;
                clearTimeout(self.timer);
            }, 5000);
        },
    },
};
</script>
<style scoped>
.content {
    position: fixed;
    right: 5px;
    bottom: 5px;
    font-size: 12px;
    padding: 5px 10px;
    background: #eb4949;
}
.fade-enter-active {
    animation: fade 0.3s linear forwards;
}
.fade-leave-active {
    animation: fade 0.3s linear forwards reverse;
}
@keyframes fade {
    from {
        transform: translateY(40px);
    }
    to {
        transform: translateY(0);
    }
}
</style>
