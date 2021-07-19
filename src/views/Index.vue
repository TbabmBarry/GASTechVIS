<template>
  <v-app class="deep-purple">
    <Navbar />
    <v-main class="grey lighten-4">
      <router-view></router-view>
    </v-main>
  </v-app>
</template>
<script>
import Navbar from "../components/Navbar";

export default {
  name: "index",
  components: {
    Navbar,
  },
};
</script>

<style></style>
