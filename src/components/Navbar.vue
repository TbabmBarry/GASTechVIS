<template>
  <nav>
      <v-app-bar app color="primary" dark>
      <v-toolbar-title class="text-uppercase white--text">
        <span class="font-weight-light">GASTech Vis</span>
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <v-toolbar-items>
        <v-btn text class="white--text" router to="/card">Card</v-btn>
        <v-btn text class="white--text" router to="/trajectory">Trajectory</v-btn>
      </v-toolbar-items>

    </v-app-bar>
  </nav>
</template>

<script>
export default {
    name: "nav-bar"
}
</script>

<style>

</style>