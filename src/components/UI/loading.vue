<template>
    <div class="load-container">
        <div class="loader">
            <div class="loading"></div>
            <label>{{ msg }}</label>
        </div>
    </div>
</template>

<script>
export default {
    name: "vue-ui-loading",
    props: {
        msg: String,
    },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.load-container {
    position: fixed;
    left: 0;
    top: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999998;
}
.load-container .loader {
    background: rgba(0, 0, 0, 0.8);
    padding: 15px 25px;
    border-radius: 5px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
}
.load-container .loader label {
    font-size: 13px;
    margin-top: 5px;
    color: #fff;
}
.load-container .loading {
    font-size: 10px;
    position: relative;
    border-top: 4px solid rgba(255, 255, 255, 0.2);
    border-right: 4px solid rgba(255, 255, 255, 0.2);
    border-bottom: 4px solid rgba(255, 255, 255, 0.2);
    border-left: 4px solid #ffffff;
    -webkit-transform: translateZ(0);
    -ms-transform: translateZ(0);
    transform: translateZ(0);
    -webkit-animation: loading 1.1s infinite linear;
    animation: loading 1.1s infinite linear;
    border-radius: 50%;
    width: 35px;
    height: 35px;
}

@-webkit-keyframes loading {
    0% {
        -webkit-transform: rotate(0deg);
        transform: rotate(0deg);
    }
    100% {
        -webkit-transform: rotate(360deg);
        transform: rotate(360deg);
    }
}
@keyframes loading {
    0% {
        -webkit-transform: rotate(0deg);
        transform: rotate(0deg);
    }
    100% {
        -webkit-transform: rotate(360deg);
        transform: rotate(360deg);
    }
}
</style>
