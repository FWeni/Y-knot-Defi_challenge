<template>
  <!-- And do not be conformed to this world, but be transformed by the renewing of your mind, 
that you may prove what is that good and acceptable and perfect will of God. - Romans 12:2 -NKJV -->
  <q-page>
    <section class="header-bg row content-start">
      <div class="col-12 row justify-between q-px-xl" style="z-index: 0; position: absolute">
        <space-bubble class="gt-xs" duration="8s" />
        <space-bubble class="gt-sm" duration="14s" delay="2s" />
        <space-bubble class="gt-lg" duration="12s" delay="1.3s" />
      </div>
      <div class="header-container row reverse-wrap justify-between" style="z-index: 1">
        <div class="column justify-start">
          <h2>
            The place to discover and
            <span>back projects</span>
            building on {{ currentChain.NETWORK_DISPLAY_NAME }}
          </h2>

          <div class="q-gutter-x-sm">
            <q-btn class="hover-accent" color="secondary" outline :to="{ name: 'allpools' }" label="VIEW ALL POOLS" />
            <q-btn class="hover-accent" color="secondary" outline label="List Project" :to="{ name: 'createballot' }" />
          </div>
        </div>
        <transition appear appear-active-class="fade-enter-active" @before-appear="beforeAppear" @appear="appear"
          @after-appear="afterAppear">
          <div class="gt-sm rocket col row justify-center">
            <img class="col q-pt-md" src="~assets/logo/tstarter-rocket.svg" width="80%" alt="Illustration" />
          </div>
        </transition>
      </div>
    </section>
    <div class="body-container">
      <section class="row justify-center q-gutter-lg">
        <!-- VIP Members -->
        <h2 class="col-12 text-center q-pt-xl">VIP Members</h2>
        <rocket-line class="col-12 text-center" />
        <p class="col-12 text-center" v-if="vipMembers.length === 0">
          There are no VIPs yet.
        </p>
        <div class="vips-card-container col" v-else-if="vipMembers.length !== 0">
          <div class="q-pa-md">
            <q-card class="vips-card">
              <q-markup-table>
                <thead>
                  <tr>
                    <th class="text-left">Account</th>
                    <th class="text-left">Last Claim ID</th>
                    <th class="text-left">Stake Balance</th>
                    <th class="text-left">Tier</th>
                    <th class="text-left">Tier History</th>
                  </tr>
                </thead>
                <tbody>
                  <VIPListView v-for="vip in vipMembers" class="col"
                    :key="`${vip.account}+${vip.last_claim_id}+${vip.stake_balance}+${vip.tier}+${vip.tierHistory}`"
                    :vipAccount="vip.account" :vipLastClaimID="vip.last_claim_id" :vipStakeBalance="vip.stake_balance"
                    :vipTier="vip.tier" :vipTierHistory="vip.tier_history" />

                </tbody>
              </q-markup-table>
            </q-card>
          </div>
        </div>
        <VIPListView v-else class="col-shrink" :vipLastClaimID="-1" />
        <!-- Featured pools -->
        <h2 class="col-12 text-center">Featured Pools</h2>
        <rocket-line class="col-12 text-center" />
        <p class="col-12 text-center" v-if="noFeaturedPools">
          There are no featured pools at the moment.
        </p>
        <div class="poolcard-container col" v-else-if="featuredPoolIdChains_sorted.length !== 0">
          <Poolcard class="col" v-for="pool in featuredPoolIdChains_sorted" :key="`featured-${pool.chain}+${pool.id}`"
            :poolID="pool.id" :chain="pool.chain" />
        </div>
        <Poolcard v-else class="col-shrink" :poolID="-1" />

        <!-- Open pools -->
        <h2 class="col-12 text-center q-pt-xl">Open Pools</h2>
        <rocket-line class="col-12 text-center" />
        <p class="col-12 text-center" v-if="openPools.length === 0">
          There are no open pools at the moment.
        </p>
        <div class="poolcard-container col" v-else-if="openPools.length !== 0">
          <Poolcard v-for="pool in openPools" :key="`open-${pool.chain}+${pool.id}`" :poolID="pool.id"
            :chain="pool.chain" />
        </div>
        <Poolcard v-else class="col-shrink" :poolID="-1" />

        <!-- Upcoming pools -->
        <h2 class="col-12 text-center q-pt-xl">Upcoming Pools</h2>
        <rocket-line class="col-12 text-center" />
        <p class="col-12 text-center" v-if="noUpcomingPools">
          There are no upcoming pools at the moment.
        </p>
        <div class="poolcard-container col" v-else-if="upcomingPools_sort.length !== 0">
          <Poolcard v-for="pool in upcomingPools_sort" :key="`upcoming-${pool.chain}+${pool.id}`" :poolID="pool.id"
            :chain="pool.chain" />
        </div>
        <Poolcard v-else class="col-shrink" :poolID="-1" />

        <div class="col-12 text-center row justify-center q-pt-md">
          <q-btn class="hover-accent" color="accent" outline :to="{ name: 'allpools' }" label="VIEW ALL POOLS" />
        </div>
      </section>
    </div>
  </q-page>
</template>

<script>
import Poolcard from "src/components/Poolcard.vue";
import RocketLine from "src/components/decor/RocketLine.vue";
import SpaceBubble from "src/components/decor/SpaceBubble.vue";
// import VIPList from "src/components/VIPList.vue";
import VIPListView from "src/components/VIPListView.vue";
import { mapGetters, mapActions } from "vuex";
export default {
  components: { Poolcard, RocketLine, SpaceBubble, VIPListView /*,VIPList*/, VIPListView },
  data() {
    return {
      featuredPoolIdChains: [],
      upcomingIDs: [],
      noUpcomingPools: false,
      noFeaturedPools: false,
      polling: null,
      vipMembers: [],
    };
  },
  computed: {
    ...mapGetters("pools", [
      "getAllPoolIDs",
      "getPoolIDsByStatus",
      "getPoolsByStatus",
      "getPoolByID",
      "getPublishedPoolIDs",
      "getPoolByIDChain"
    ]),
    ...mapGetters("blockchains", ["currentChain"]),
    openPools() {
      let open_pools = this.getPoolsByStatus("open");
      if (open_pools === undefined) return [];
      else return open_pools;
    },

    upcomingPools_sort() {
      let pools = this.getPoolsByStatus("upcoming");
      if (pools === undefined) return [];
      else return pools;
    },

    featuredPoolIdChains_sorted() {
      if (this.featuredPoolIdChains.length > 0) {
        let featuredPools = [];
        for (const id_chain of this.featuredPoolIdChains) {
          var temp_pool = this.getPoolByIDChain(id_chain.id, id_chain.chain);
          if (
            temp_pool.status !== undefined &&
            (temp_pool.status === "published" || temp_pool.status === "success")
          ) {
            featuredPools.push(temp_pool);
          }
        }
        return this.sortPools(featuredPools);
      } else {
        return [];
      }
    }
  },
  methods: {
    ...mapActions("pools", [
      "getAllChainPools",
      "getFeaturedChainPools",
      "getUpcomingChainPools"
    ]),
    ...mapActions("account", [
      "getChainVIPAccountsInfo"
    ]),

    sortPools(pools) {
      // TODO claimable
      let order = ["open", "upcoming", "completed", "filled", "cancelled"];
      pools.sort((a, b) => {
        return order.indexOf(a.pool_status) - order.indexOf(b.pool_status);
      });
      // console.log(result);
      return pools.map(a => ({ id: a.id, chain: a.chain }));
    },

    beforeAppear: function (el) {
      // console.log("beforeAppear");
    },
    appear: function (el) {
      // console.log("appear!");
    },
    afterAppear: function (el) {
      // console.log("afterAppear!");
    }
  },
  async mounted() {
    console.log("Go to the ant, you sluggard! Consider her ways and be wise,");
    this.featuredPoolIdChains = await this.getFeaturedChainPools();
    console.log(this.featuredPoolIdChains);
    if (this.featuredPoolIdChains.length === 0) this.noFeaturedPools = true;
    await this.getAllChainPools();
    this.upcomingIDs = await this.getUpcomingChainPools();
    if (this.upcomingIDs.length === 0) this.noUpcomingPools = true;
    // Start polling every 1min for any updates
    this.polling = setInterval(async () => {
      await this.getAllChainPools();
    }, 30000);
    this.vipMembers = await this.getChainVIPAccountsInfo();
    console.log(this.vipMembers)
  },


};
</script>

<style lang="scss" scoped>
.header-bg {
  height: 550px;
}

.header-container {
  padding-top: 100px;
}

.header-container h2 {
  color: $secondary;
  line-height: 60px;
  font-family: poppins-regular;
  margin-top: 0px;
  margin-bottom: 15px;
  max-width: 600px;

  @media only screen and (max-width: 390px) {
    font-size: 38px;
    line-height: 50px;
  }
}

.header-container h2 span {
  color: $accent;
}

.body-container {
  padding-top: 50px;
}

h2 {
  margin-bottom: 10px;
}

// Rocket
@keyframes up_down {
  0% {
    transform: translateY(0) translateX(0);
  }

  25% {
    transform: translateY(-30px) translateX(0);
  }

  75% {
    transform: translateY(30px) translateX(0);
  }
}

@keyframes go {
  from {
    transform: translateY(150px) translateX(0);
  }

  to {
    transform: translateY(0) translateX(0);
  }
}

.rocket {
  animation: up_down;
  animation-duration: 15s;
  animation-delay: 1s;
  animation-iteration-count: infinite;
  position: relative;
  min-width: 250px;
}

.rocket img {
  max-width: 300px;
}

.fade-enter-active {
  animation: go 2s;
  animation-timing-function: cubic-bezier(0.32, 0.45, 0.07, 1.03);
}

.space-bubble {
  width: 450px;
  position: relative;

  &:nth-of-type(1) {
    transform: rotate(-20deg) scale(0.85);
  }

  &:nth-of-type(2) {
    top: -80px;
  }

  &:nth-of-type(3) {
    transform: rotate(0deg);
  }
}
</style>
