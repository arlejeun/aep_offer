<template>
  <article
    class="flex lg:h-screen w-screen lg:overflow-hidden xs:flex-col lg:flex-row"
  >
    <div class="relative lg:w-2/3 xs:w-full xs:h-84 lg:h-full post-left">
      <img
        :src="article.img"
        :alt="article.alt"
        class="absolute w-full mt-8 xs:mt-32 object-cover"
      />

      <div class="flex absolute top-3rem right-3rem">
        <NuxtLink :to="{ name: 'id', params: { id:$route.params.id} }" class="mr-8 self-center font-bold hover:underline">
          All personalized offers
        </NuxtLink>
        <!--<a
          href="https://nuxtjs.org/blog/creating-blog-with-nuxt-content"
          class="mr-8 self-center font-bold hover:underline"
        >
          Tutorial
        </a>-->
        <AppSearchInput />
      </div>
    </div>
    <div
      class="relative xs:py-8 xs:px-8 lg:py-32 lg:px-16 lg:w-1/2 xs:w-full h-full overflow-y-scroll markdown-body post-right custom-scroll"
    >
      <div class="bg-blue-500 text-4xl text-white p-2 mb-4">
        {{ article.title }}
      </div>
      <p>{{ article.description }}</p>

      <div class="relative">
        <div class="mt-8 flex uppercase text-sm">
          <p class="mr-3">
            {{ formatDate(article.updatedAt) }}
          </p>
          <span class="mr-3">•</span>
          <span v-for="(tag, id) in article.tags" :key="id">
            <NuxtLink 
             :to="{ name: 'id-offers-tag-tag', params: { id:$route.params.id, tag: tag } }">
              <span
                class="truncate uppercase tracking-wider font-medium text-ss px-2 py-1 rounded-full mr-2 mb-2 text-blue-600 bg-blue-200 transition-colors duration-300 ease-linear"
              >
                {{ tags[tag].name }}
              </span>
            </NuxtLink>
          </span>
        </div>
      </div>

      <nuxt-content class="mt-4" :document="article" />

      <div
        class="border-2 border-blue-500 shadow-md rounded px-8 pt-6 py-4 my-4 flex flex-col my-2"
      >
        <div class="-mx-3 md:flex mb-6">
          <div
            v-if="
              typeof article.dispos == 'object' && article.dispos.length > 0
            "
            class="md:w-full px-3"
          >
            <label
              class="block uppercase tracking-wide text-grey-darker text-xs font-bold mb-2"
              for="grid-first-name"
            >
              Offer result
            </label>
            <select v-model="dispo"
              class="form-select appearance-none block w-full bg-grey-lighter text-grey-darker border border-red rounded py-3 px-4 mb-3"
            >
              <option v-for="(dispo, id) in article.dispos" :key="id">
                {{ dispo }}
              </option>
            </select>
          </div>
        </div>

        <div class="-mx-3 md:flex mb-6">
          <div class="md:w-full px-3 mb-6 md:mb-0">
            <label
              class="block uppercase tracking-wide text-grey-darker text-xs font-bold mb-2"
              for="grid-first-name"
            >
              Comments
            </label>
            <input
              class="appearance-none block w-full bg-grey-lighter text-grey-darker border border-red rounded py-3 px-4 mb-3"
              id="grid-first-name"
              type="text"
              placeholder="Special comments"
              v-model="comments"
            />
            <p class="text-red text-xs italic">Please fill out this field.</p>
          </div>
        </div>

        <button
          type="submit"
          v-show="!isLoading"
          class="rounded text-white bg-blue-500 py-3 px-2"
          @click.prevent="sendAdobeEvent"
        >
          Submit
        </button>

        <button
          v-show="isLoading"
          class="rounded text-white my-0 bg-blue-500 py-3 px-2"
          disabled
        >
          <div class="bg-blue-500 relative flex justify-center items-center">
            <svg
              class="animate-spin h-4 w-4 rounded-full bg-transparent border-2 border-transparent border-opacity-50"
              style="border-right-color: white; border-top-color: white"
              viewBox="0 0 24 24"
            ></svg>
            <p class="text-white ml-4">Processing</p>
          </div>
        </button>
      </div>

      <!-- content author component 
      <author :author="article.author" /> -->
      <!-- prevNext component
      <PrevNext :prev="prev" :next="next" class="mt-8" /> -->
    </div>
  </article>
</template>
<script>
export default {
  name: "OfferDetail",
  async asyncData({ $content, params }) {
    const article = await $content("articles", params.slug).fetch();
    const tagsList = await $content("tags")
      .only(["name", "slug"])
      .where({ name: { $containsAny: article.tags } })
      .fetch();
    const tags = Object.assign({}, ...tagsList.map((s) => ({ [s.name]: s })));
    const [prev, next] = await $content("articles")
      .only(["title", "slug"])
      .sortBy("createdAt", "asc")
      .surround(params.slug)
      .fetch();
    return {
      article,
      tags,
      prev,
      next,
    };
  },

  data() {
    return {
      dispo: "",
      comments: "",
      email: "",
      isLoading: false,
    };
  },
  mounted() {
    this.email = this.$route.params.id;
  },

  methods: {
    formatDate(date) {
      const options = { year: "numeric", month: "long", day: "numeric" };
      return new Date(date).toLocaleDateString("en", options);
    },

    sendAdobeEvent() {
      let self = this;
      if (!self.dispo == "") {
        self.isLoading = true;
        const myUrl = "http://localhost:8050/sendAdobeEvents";
        const myData = {
          gdemo_email: self.email || "arnaud.lejeune@genesys.com",
          disposition: self.dispo || "Rewards Program Interest",
          comments: self.comments || "",
        };
        this.$axios.post(myUrl, myData);
        self.isLoading = false;
      }
    },
  },
};
</script>
<style>
.nuxt-content p {
  margin-bottom: 20px;
}
.nuxt-content h2 {
  font-weight: bold;
  font-size: 28px;
}
.nuxt-content h3 {
  font-weight: bold;
  font-size: 22px;
}
.icon.icon-link {
  background-image: url("~assets/svg/icon-hashtag.svg");
  display: inline-block;
  width: 20px;
  height: 20px;
  background-size: 20px 20px;
}

.dropdown:hover .dropdown-menu {
  display: block;
  z-index: 1000;
}

.top-100 {
  top: 100%;
}
.bottom-100 {
  bottom: 100%;
}
.max-h-select {
  max-height: 300px;
}

.loader {
  border-top-color: #3498db;
  -webkit-animation: spinner 1.5s linear infinite;
  animation: spinner 1.5s linear infinite;
}

@-webkit-keyframes spinner {
  0% {
    -webkit-transform: rotate(0deg);
  }
  100% {
    -webkit-transform: rotate(360deg);
  }
}

@keyframes spinner {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
